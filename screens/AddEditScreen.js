import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createContact, updateContact, deleteContact } from '../database/contactsDAO';

// ─── Validate input ────────────────────────────────────────
const validate = (name, phone) => {
  if (!name.trim()) return 'Tên không được để trống.';
  if (name.trim().length < 2) return 'Tên phải có ít nhất 2 ký tự.';
  if (!phone.trim()) return 'Số điện thoại không được để trống.';
  if (!/^[0-9+\-\s]{8,15}$/.test(phone.trim()))
    return 'Số điện thoại không hợp lệ (8-15 chữ số).';
  return null;
};

// ─── Add / Edit Contact Screen ─────────────────────────────
export default function AddEditScreen({ contact, onBack, onSave }) {
  const isEditing = !!contact;

  const [name, setName]   = useState(contact?.name ?? '');
  const [phone, setPhone] = useState(contact?.phone ?? '');
  const [email, setEmail] = useState(contact?.email ?? '');
  const [saving, setSaving]   = useState(false);
  const [nameErr, setNameErr] = useState('');
  const [phoneErr, setPhoneErr] = useState('');

  // Reset lỗi khi user gõ
  useEffect(() => { if (nameErr) setNameErr(''); }, [name, nameErr]);
  useEffect(() => { if (phoneErr) setPhoneErr(''); }, [phone, phoneErr]);

  // ─── Lưu liên hệ (Create / Update) ───────────────────────
  const handleSave = async () => {
    // Validate
    if (!name.trim()) { setNameErr('Tên không được để trống.'); return; }
    if (name.trim().length < 2) { setNameErr('Tên phải có ít nhất 2 ký tự.'); return; }
    if (!phone.trim()) { setPhoneErr('Số điện thoại không được để trống.'); return; }
    if (!/^[0-9+\-\s]{8,15}$/.test(phone.trim())) {
      setPhoneErr('Số điện thoại không hợp lệ (8-15 chữ số).'); return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        // UPDATE — Transaction đảm bảo toàn vẹn
        await updateContact(contact.id, name, phone, email);
        Alert.alert('✅ Thành công', `Đã cập nhật "${name.trim()}"`);
      } else {
        // CREATE — Transaction đảm bảo atomicity
        await createContact(name, phone, email);
        Alert.alert('✅ Thành công', `Đã thêm "${name.trim()}" vào danh bạ`);
      }
      onSave();
    } catch (err) {
      Alert.alert('❌ Lỗi', err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Xóa liên hệ (chỉ hiển thị khi đang edit) ───────────
  const handleDelete = () => {
    Alert.alert(
      '⚠️ Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa "${contact.name}" không? Hành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              // DELETE — Transaction đảm bảo atomicity
              await deleteContact(contact.id);
              Alert.alert('🗑️ Đã xóa', `"${contact.name}" đã được xóa.`);
              onSave();
            } catch (err) {
              Alert.alert('Lỗi', err.message);
            }
          },
        },
      ]
    );
  };

  // ─── Render ──────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? '✏️ Sửa liên hệ' : '➕ Thêm liên hệ'}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* Avatar preview */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Ionicons
                name={isEditing ? 'person' : 'person-add'}
                size={40}
                color="#6366F1"
              />
            </View>
            <Text style={styles.avatarHint}>
              {isEditing ? 'Chỉnh sửa thông tin liên hệ' : 'Điền thông tin liên hệ mới'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Tên */}
            <Text style={styles.label}>
              <Ionicons name="person-outline" size={14} color="#6366F1" /> Họ và tên *
            </Text>
            <TextInput
              style={[styles.input, nameErr && styles.inputError]}
              placeholder="VD: Nguyễn Văn An"
              placeholderTextColor="#CBD5E1"
              value={name}
              onChangeText={setName}
              returnKeyType="next"
            />
            {nameErr ? <Text style={styles.errorText}>{nameErr}</Text> : null}

            {/* Số điện thoại */}
            <Text style={[styles.label, { marginTop: 16 }]}>
              <Ionicons name="call-outline" size={14} color="#6366F1" /> Số điện thoại *
            </Text>
            <TextInput
              style={[styles.input, phoneErr && styles.inputError]}
              placeholder="VD: 0901234567"
              placeholderTextColor="#CBD5E1"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="next"
            />
            {phoneErr ? <Text style={styles.errorText}>{phoneErr}</Text> : null}

            {/* Email */}
            <Text style={[styles.label, { marginTop: 16 }]}>
              <Ionicons name="mail-outline" size={14} color="#6366F1" /> Email (tùy chọn)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="VD: example@email.com"
              placeholderTextColor="#CBD5E1"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>

          {/* Nút Lưu */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>
                  {isEditing ? 'Cập nhật' : 'Lưu liên hệ'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Nút Xóa — chỉ khi edit */}
          {isEditing && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.85}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={styles.deleteBtnText}>Xóa liên hệ này</Text>
            </TouchableOpacity>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  // Body
  body: { padding: 20, paddingBottom: 40 },

  // Avatar
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarHint: { color: '#64748B', fontSize: 13 },

  // Form
  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1E293B',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
  },

  // Save Button
  saveBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 15,
    marginBottom: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  // Delete Button
  deleteBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 15,
  },
});
