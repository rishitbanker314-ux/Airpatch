import { useState } from 'react';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

export function SmokeTest() {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const runTest = async () => {
    setStatus('running');
    setMessage('Connecting to Firestore...');
    try {
      // 1. Write a test document
      const testCollection = collection(db, '_smoke_test_logs');
      const testDocRef = await addDoc(testCollection, {
        timestamp: new Date().toISOString(),
        message: 'Smoke test write successful',
      });
      setMessage(`Document written with ID: ${testDocRef.id}. Reading it back...`);

      // 2. Read it back
      const readDocSnap = await getDoc(doc(db, '_smoke_test_logs', testDocRef.id));
      
      if (readDocSnap.exists() && readDocSnap.data().message === 'Smoke test write successful') {
        setStatus('success');
        setMessage(`Success! Document read confirmed. ID: ${testDocRef.id}`);
      } else {
        throw new Error("Document read back did not match expected data.");
      }
    } catch (err: any) {
      console.error("Smoke test failed:", err);
      setStatus('error');
      setMessage(`Error: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto mt-10 bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-xl font-bold">Firebase Connectivity Smoke Test</h1>
      <p className="text-gray-500 text-sm">
        This is a temporary developer tool to verify the frontend can read and write to Firestore.
      </p>
      
      <button 
        onClick={runTest}
        disabled={status === 'running'}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
      >
        {status === 'running' ? 'Running Test...' : 'Run Connectivity Test'}
      </button>

      {status !== 'idle' && (
        <div className={`p-4 rounded border ${
          status === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          status === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-gray-50 border-gray-200 text-gray-800'
        }`}>
          <p className="font-mono text-sm">{message}</p>
        </div>
      )}
    </div>
  );
}
