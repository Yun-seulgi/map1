import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA9GwOvhiKgivI_bQ7CLfjNXdYOoF7UrYM",
  authDomain: "map1-75007.firebaseapp.com",
  projectId: "map1-75007",
  storageBucket: "map1-75007.firebasestorage.app",
  messagingSenderId: "737801614934",
  appId: "1:737801614934:web:dfcf2a5c7cb86a9ee02df7",
  measurementId: "G-MMZ7CC7Z0K"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// HTML에서 자유롭게 연동할 수 있도록 전역(window) 객체로 등록
window.db = db;
window.fsDoc = doc;
window.fsSetDoc = setDoc;
window.fsDeleteDoc = deleteDoc;
window.fsWriteBatch = writeBatch;

// 실시간 자동 동기화 리스너
onSnapshot(collection(db, "stores"), (snapshot) => {
  let newStores = [];
  snapshot.forEach((doc) => {
    newStores.push({ id: doc.id, ...doc.data() });
  });
  window.stores = newStores;
  if (window.renderApp) window.renderApp();
});