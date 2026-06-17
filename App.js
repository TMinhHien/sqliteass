import React, { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import ContactListScreen from './screens/ContactListScreen';
import AddEditScreen from './screens/AddEditScreen';

/**
 * App — Simple state-based navigation (no react-navigation needed)
 * Screens: 'list' | 'addEdit'
 */
export default function App() {
  const [screen, setScreen]           = useState('list');
  const [editContact, setEditContact] = useState(null);
  const [onSaveCallback, setOnSaveCallback] = useState(null);

  const goToAdd = useCallback((reloadFn) => {
    setEditContact(null);
    setOnSaveCallback(() => reloadFn);
    setScreen('addEdit');
  }, []);

  const goToEdit = useCallback((contact, reloadFn) => {
    setEditContact(contact);
    setOnSaveCallback(() => reloadFn);
    setScreen('addEdit');
  }, []);

  const goToList = useCallback(() => {
    // Gọi reload danh sách khi quay lại
    if (onSaveCallback) onSaveCallback();
    setScreen('list');
    setEditContact(null);
  }, [onSaveCallback]);

  return (
    <>
      <StatusBar style="light" />
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
