import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView,
  KeyboardAvoidingView, Platform, SafeAreaView,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createContact, updateContact, deleteContact } from '../database/contactsDAO';

const AVATAR_COLORS = [
  '#FF3B30','#FF9500','#FFCC00','#34C759',
  '#5AC8FA','#007AFF','#5856D6','#AF52DE','#FF2D55',
];
const getAvatarColor = (name = '') => {
  const code = name.charCodeAt(0) || 65;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};
const getInitials = (name = '') => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function AddEditScreen({ contact, onBack, onSave }) {
  const isEditing = !!contact;

  const [name,  setName]  = useState(contact?.name  ?? '');
  const [phone, setPhone] = useState(contact?.phone ?? '');
  const [email, setEmail] = useState(contact?.email ?? '');
  const [saving, setSaving] = useState(false);

  const [nameErr,  setNameErr]  = useState('');
  const [phoneErr, setPhoneErr] = useState('');

  useEffect(() => { if (nameErr)  setNameErr('');  }, [name,  nameErr]);
  useEffect(() => { if (phoneErr) setPhoneErr(''); }, [phone, phoneErr]);

  const handleSave = async () => {
    if (!name.trim())              { setNameErr('Vui lòng nhập họ và tên');             return; }
    if (name.trim().length < 2)    { setNameErr('Tên phải có ít nhất 2 ký tự');         return; }
    if (!phone.trim())             { setPhoneErr('Vui lòng nhập số điện thoại');         return; }
    if (!/^[0-9+\-\s]{8,15}$/.test(phone.trim())) { setPhoneErr('Số điện thoại không hợp lệ'); return; }

    setSaving(true);
    try {
      if (isEditing) {
        await updateContact(contact.id, name, phone, email);
      } else {
        await createContact(name, phone, email);
      }
      onSave();
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xóa liên hệ',
      `Bạn có chắc muốn xóa "${contact.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa liên hệ', style: 'destructive',
          onPress: async () => {
            try {
              await deleteContact(contact.id);
              onSave();
            } catch (err) {
              Alert.alert('Lỗi', err.message);
            }
          },
        },
      ]
    );
  };

  const avatarColor = getAvatarColor(name || contact?.name || '');
  const initials    = getInitials(name || contact?.name || '');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Navigation bar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={onBack} style={styles.navBtn}>
          <Text style={styles.navBtnBlue}>Hủy</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{isEditing ? 'Sửa liên hệ' : 'Liên hệ mới'}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.navBtn} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color="#007AFF" />
            : <Text style={[styles.navBtnBlue, { fontWeight: '600' }]}>Xong</Text>
          }
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{initials || '?'}</Text>
            </View>
            <Text style={styles.avatarHint}>
              {isEditing ? 'Chỉnh sửa liên hệ' : 'Liên hệ mới'}
            </Text>
          </View>

          {/* Form fields */}
          <View style={styles.section}>
            {/* Tên */}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Họ và tên</Text>
              <TextInput
                style={[styles.fieldInput, nameErr && styles.fieldInputErr]}
                placeholder="Bắt buộc"
                placeholderTextColor="#C7C7CC"
                value={name}
                onChangeText={setName}
                returnKeyType="next"
              />
            </View>
            {nameErr ? <Text style={styles.errText}>{nameErr}</Text> : null}
            <View style={styles.separator} />

            {/* Số điện thoại */}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Điện thoại</Text>
              <TextInput
                style={[styles.fieldInput, phoneErr && styles.fieldInputErr]}
                placeholder="Bắt buộc"
                placeholderTextColor="#C7C7CC"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
            </View>
            {phoneErr ? <Text style={styles.errText}>{phoneErr}</Text> : null}
            <View style={styles.separator} />

            {/* Email */}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Tùy chọn"
                placeholderTextColor="#C7C7CC"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </View>
          </View>

          {/* Nút xóa (chỉ khi edit) */}
          {isEditing && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.7}>
              <Text style={styles.deleteBtnText}>Xóa liên hệ</Text>
            </TouchableOpacity>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },

  // Navbar
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  navBtn: { minWidth: 50 },
  navBtnBlue: { color: '#007AFF', fontSize: 17 },
  navTitle: { fontSize: 17, fontWeight: '600', color: '#000' },

  body: { paddingBottom: 40 },

  // Avatar
  avatarWrap: { alignItems: 'center', paddingVertical: 28 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '600' },
  avatarHint: { color: '#8E8E93', fontSize: 13 },

  // Form section
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  fieldLabel: {
    width: 100,
    fontSize: 16,
    color: '#000',
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  fieldInputErr: { color: '#FF3B30' },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginLeft: 16,
  },
  errText: {
    color: '#FF3B30',
    fontSize: 12,
    paddingHorizontal: 20,
    marginBottom: 4,
  },

  // Delete
  deleteBtn: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },
  deleteBtnText: {
    color: '#FF3B30',
    fontSize: 17,
    fontWeight: '400',
  },
});
