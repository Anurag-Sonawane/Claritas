import { useState, useCallback } from 'react';
import * as api from '../services/courseApi.js';

export default function useMediaManager() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [storage, setStorage] = useState({ used: 0, quota: 10 });
  const [loading, setLoading] = useState(false);
  const [activeFolder, setActiveFolder] = useState('');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.getMediaLibrary({ folder: activeFolder, query, type: typeFilter });
      setFiles(r.data);
      setFolders(r.folders);
      setStorage(r.storage);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [activeFolder, query, typeFilter]);

  const uploadFile = async (file) => {
    setUploading(true);
    setUploadProgress(0);
    try {
      const r = await api.uploadMedia(file, ({ percent }) => setUploadProgress(percent), activeFolder || 'Course Assets');
      await fetchMedia();
      return r.data;
    } catch (e) { console.error(e); return null; }
    finally { setUploading(false); setUploadProgress(0); }
  };

  const deleteFile = async (id) => {
    try {
      await api.deleteMediaItem(id);
      if (selectedFile?.id === id) setSelectedFile(null);
      await fetchMedia();
      return true;
    } catch (e) { console.error(e); return false; }
  };

  return {
    files, folders, storage, loading, fetchMedia,
    activeFolder, setActiveFolder, query, setQuery,
    typeFilter, setTypeFilter, selectedFile, setSelectedFile,
    uploading, uploadProgress, uploadFile, deleteFile,
  };
}
