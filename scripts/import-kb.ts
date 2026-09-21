/**
 * Karl Knowledge Base Import Script
 * 
 * 把 karl-detective-kb 中的所有案件分析文件导入到 NarraLume 数据库
 * 导入后可以通过 FTS 全文搜索在创作时自动检索
 * 
 * 用法：
 *   npx tsx scripts/import-kb.ts /path/to/karl-detective-kb
 */

import { readdir, readFile } from "node:fs/promises";
import { join, basename } from "node:path";
import { DatabaseSync } from "node:sqlite";

const KB_ROOT = process.argv[2] || "./data/karl-detective-kb";
const DB_PATH = process.env.NARRALLUME_DB || "./data/narralume.sqlite";

interface ImportedFile {
  path: string;
  title: string;
  content: string;
  show: string;
}

async function findMarkdownFiles(dir: string, showName: string = ""): Promise<ImportedFile[]> {
  const results: ImportedFile[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const subResults = await findMarkdownFiles(fullPath, entry.name);
        results.push(...subResults);
      } else if (entry.name.endsWith(".md") && !entry.name.startsWith("_")) {
        try {
          const content = await readFile(fullPath, "utf-8");
          const title = basename(entry.name, ".md");
          results.push({
            path: fullPath,
            title,
            content,
            show: showName || "general",
          });
        } catch (e) {
          console.warn(`跳过无法读取的文件: ${fullPath}`);
        }
      }
    }
  } catch (e) {
    console.warn(`无法读取目录: ${dir}`);
  }
  
  return results;
}

function splitIntoChunks(content: string, maxChunkSize: number = 2000): string[] {
  const chunks: string[] = [];
  const paragraphs = content.split(/\n\n+/);
  
  let currentChunk = "";
  for (const para of paragraphs) {
    if ((currentChunk + para).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

async function main() {
  console.log("=== Karl Knowledge Base 导入工具 ===");
  console.log(`知识库路径: ${KB_ROOT}`);
  console.log(`数据库路径: ${DB_PATH}`);
  
  // 1. 收集所有 md 文件
  console.log("\n[1/4] 扫描知识库文件...");
  const episodeDir = join(KB_ROOT, "02_episode_analysis");
  const novelDir = join(KB_ROOT, "02_novel_analysis");
  
  const episodeFiles = await findMarkdownFiles(episodeDir);
  const novelFiles = await findMarkdownFiles(novelDir);
  const allFiles = [...episodeFiles, ...novelFiles];
  
  console.log(`  找到 ${allFiles.length} 个文件`);
  
  // 按剧集统计
  const byShow: Record<string, number> = {};
  for (const f of allFiles) {
    byShow[f.show] = (byShow[f.show] || 0) + 1;
  }
  console.log("  分类统计:");
  for (const [show, count] of Object.entries(byShow)) {
    console.log(`    - ${show}: ${count} 个`);
  }
  
  // 2. 连接数据库
  console.log("\n[2/4] 连接数据库...");
  const db = new DatabaseSync(DB_PATH);
  
  // 3. 创建项目（如果不存在）
  console.log("\n[3/4] 创建知识库项目...");
  
  const projectId = "karl-knowledge-base";
  
  try {
    const projectExists = db.prepare("SELECT id FROM projects WHERE id = ?").get(projectId);
    
    if (!projectExists) {
      db.prepare(`
        INSERT INTO projects (id, title, description, created_at, updated_at)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
      `).run(projectId, "Karl Detective Knowledge Base", "神探卡尔探案集 - 侦探推理知识库");
      console.log("  创建知识库项目");
    } else {
      console.log("  知识库项目已存在");
    }
  } catch (e) {
    console.warn("  projects 表可能不存在，继续尝试导入...");
  }
  
  // 4. 导入文件为文档和文本片段
  console.log("\n[4/4] 导入文件...");
  
  let importedDocs = 0;
  let importedSegments = 0;
  
  for (const file of allFiles) {
    // 创建文档
    const docId = `doc-${file.show}-${file.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
    
    try {
      const docExists = db.prepare("SELECT id FROM documents WHERE id = ?").get(docId);
      
      if (!docExists) {
        db.prepare(`
          INSERT INTO documents (id, project_id, kind, title, created_at, updated_at)
          VALUES (?, ?, 'reference', ?, datetime('now'), datetime('now'))
        `).run(docId, projectId, `${file.show} - ${file.title}`);
        
        // 创建文档版本
        const versionId = `ver-${docId}`;
        db.prepare(`
          INSERT INTO document_versions (id, document_id, content, source, created_at)
          VALUES (?, ?, ?, 'karl-kb-import', datetime('now'))
        `).run(versionId, docId, file.content);
        
        // 更新文档当前版本
        db.prepare(`
          UPDATE documents SET current_version_id = ? WHERE id = ?
        `).run(versionId, docId);
        
        importedDocs++;
      }
      
      // 分割为片段并导入到 text_segments
      const chunks = splitIntoChunks(file.content);
      
      chunks.forEach((chunk, index) => {
        const segmentId = `seg-${docId}-${index}`;
        
        try {
          const segExists = db.prepare("SELECT id FROM text_segments WHERE id = ?").get(segmentId);
          
          if (!segExists) {
            db.prepare(`
              INSERT INTO text_segments (
                id, project_id, source_type, source_id, title, content, authority,
                metadata_json, created_at, updated_at
              ) VALUES (?, ?, 'reference', ?, ?, ?, 'reference', ?, datetime('now'), datetime('now'))
            `).run(
              segmentId,
              projectId,
              docId,
              `${file.show} - ${file.title} (片段 ${index + 1})`,
              chunk,
              JSON.stringify({ show: file.show, episode: file.title, chunkIndex: index })
            );
            
            importedSegments++;
          }
        } catch (e) {
          // text_segments 表可能不存在，跳过
        }
      });
    } catch (e) {
      // documents 表可能不存在，跳过这个文件
      console.warn(`  跳过 ${file.title}: 表结构不匹配`);
    }
  }
  
  console.log(`  导入 ${importedDocs} 个文档`);
  console.log(`  导入 ${importedSegments} 个文本片段`);
  
  db.close();
  
  console.log("\n=== 导入完成！===");
  console.log("\n知识库现在可以在创作时通过 FTS 全文搜索自动检索了。");
}

main().catch(console.error);
