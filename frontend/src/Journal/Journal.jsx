import React, { useEffect, useState } from 'react';
import { ClipboardList, Save } from 'lucide-react';
import { db } from '../config/firebase-config';
// import firebase from 'firebase/app';
import './Journal.css';

function Journal() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const snapshot = await db.collection('journals').orderBy('timestamp', 'desc').get();
        const entriesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEntries(entriesList);
      } catch (error) {
        console.error("Error fetching documents: ", error);
      }
    };

    fetchEntries();
  }, []);

  const handleSave = async () => {
    if (title.trim() === '' || body.trim() === '') return;

    setLoading(true);

    try {
      await db.collection('journals').add({
        title,
        content: body,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setTitle('');
      setBody('');
      alert('Journal entry saved!');
      const snapshot = await db.collection('journals').orderBy('timestamp', 'desc').get();
      const entriesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEntries(entriesList);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert('Failed to save journal entry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="journal-container">
      <div className="journal-entry">
        <div className="header">
          <ClipboardList size={20} className="text-purple-600 mt-1 ml-3" />
          <div className="font-semibold text-2xl ml-4">Journal</div>
        </div>
        <div className="journal-content">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title of your entry..."
            className="journal-title-input"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your thoughts here..."
            rows={10}
            className="journal-textarea"
          />
          <button onClick={handleSave} disabled={loading} className="save-button">
            <Save size={16} className="save-icon" />
            {loading ? ' Saving...' : ' Save Entry'}
          </button>
        </div>
      </div>
      <div className="journal-list">
        <h2 className="logs-title">Previous Logs</h2>
        {entries.map((entry) => (
          <div key={entry.id} className="journal-item">
            <h3 className="journal-title">{entry.title || 'Untitled'}</h3>
            <p className="journal-body">{entry.content}</p>
            <small className="journal-date">{new Date(entry.timestamp?.toDate()).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Journal;
