import { ProjectData } from '../types';

export function exportProjectFile(projectData: ProjectData, filename?: string) {
  const jsonStr = JSON.stringify(projectData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const safeName = filename || `PrintBatch_${projectData.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pbproject`;
  link.download = safeName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importProjectFile(file: File): Promise<ProjectData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as ProjectData;

        // Kiểm tra tính hợp lệ cơ bản
        if (!data || !data.fields || !Array.isArray(data.fields) || !data.templateDataUrl) {
          throw new Error('Định dạng file dự án (.pbproject) không hợp lệ hoặc bị thiếu dữ liệu phôi!');
        }

        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Không thể đọc file dự án!'));
    reader.readAsText(file);
  });
}
