import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { db } from '../Firebace'; 
const Account = () => {
  const [users, setUsers] = useState([]);
  const auth = getAuth();

  useEffect(() => {
    const fetchUsers = async (uid) => {
      try {
        const usersCollectionRef = collection(db, "users");
        const q = query(usersCollectionRef, where("author.id", "==", uid));
        const usersSnapshot = await getDocs(q);
        const userData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
  
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        fetchUsers(user.uid);
      }
    });
  
    return () => unsubscribe();
  }, [auth]);

  return (
    <div className='parent-name'>
      {users.map(user => (
        <p key={user.id}>
          <span>
            使用者：{user.author.username} 様
          </span>
        </p>
      ))}
    </div>
  );
};

export default Account;
