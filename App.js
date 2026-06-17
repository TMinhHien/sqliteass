import React, { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import ContactListScreen from './screens/ContactListScreen';
import AddEditScreen from './screens/AddEditScreen';

/**
 * App — Simple state-based navigation
 * Screens: 'list' | 'addEdit'
 */
export default function App() {
  const [screen, setScreen]           = useState('list');
  const [editContact, setEditContact] = useState(null);
  // useRef để lưu callback — tránh lỗi useState với function
  const reloadRef = useRef(null);

  const goToAdd = (reloadFn) => {
    reloadRef.current = reloadFn;
    setEditContact(null);
    setScreen('addEdit');
  };

  const goToEdit = (contact, reloadFn) => {
    reloadRef.current = reloadFn;
    setEditContact(contact);
    setScreen('addEdit');
  };

  const goToList = () => {
    if (reloadRef.current) reloadRef.current();
    setScreen('list');
    setEditContact(null);
  };

  return (
    <>
      <StatusBar style="dark" />
      {screen === 'list' ? (
        <ContactListScreen onAdd={goToAdd} onEdit={goToEdit} />
      ) : (
        <AddEditScreen
          contact={editContact}
          onBack={goToList}
          onSave={goToList}
        />
      )}
    </>
  );
}
