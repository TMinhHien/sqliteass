import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getAllContacts,
  searchContacts,
  deleteContact,
  bulkInsertContacts,
  countContacts,
} from '../database/contactsDAO';

// ─── Avatar màu dựa theo chữ cái đầu ───────────────────
const AVATAR_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#3B82F6', '#14B8A6',
];
const getAvatarColor = (name = '') => {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};
const getInitials = (name = '') =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

// ─── Mẫu danh bạ demo ───────────────────────────────────
const DEMO_CONTACTS = [
  { name: 'An Nguyễn', phone: '0901234567', email: 'an.nguyen@email.com' },
  { name: 'Bình Trần', phone: '0912345678', email: 'binh.tran@email.com' },
  { name: 'Chi Lê',    phone: '0923456789', email: 'chi.le@email.com' },
  { name: 'Dũng Phạm', phone: '0934567890', email: '' },
  { name: 'Em Hoàng',  phone: '0945678901', email: 'em.hoang@email.com' },
];

// ─── Component ContactItem ───────────────────────────────
const ContactItem = React.memo(({ item, onEdit, onDelete }) => {
  const avatarColor = getAvatarColor(item.name);

  const handleDelete = () => {
    Alert.alert(
      'Xóa liên hệ',
      `Bạn có chắc muốn xóa "${item.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => onDelete(item.id) },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
      </View>

      {/* Info */}
      <TouchableOpacity style={styles.cardContent} onPress={() => onEdit(item)} activeOpacity={0.7}>
        <Text style={styles.contactName}>{item.name}</Text>
        <View style={styles.contactMeta}>
          <Ionicons name="call-outline" size={13} color="#6366F1" />
          <Text style={styles.contactPhone}> {item.phone}</Text>
        </View>
        {item.email ? (
          <View style={styles.contactMeta}>
            <Ionicons name="mail-outline" size={13} color="#64748B" />
            <Text style={styles.contactEmail}> {item.email}</Text>
          </View>
        ) : null}
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(item)}>
          <Ionicons name="create-outline" size={18} color="#6366F1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ─── Màn hình chính: Danh sách liên hệ ────────────────────
export default function ContactListScreen({ onAdd, onEdit }) {
  const [contacts, setContacts] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Load dữ liệu
  const loadContacts = useCallback(async (searchQuery = '') => {
    try {
      const data = searchQuery
        ? await searchContacts(searchQuery)
        : await getAllContacts();
      setContacts(data);
      const count = await countContacts();
      setTotalCount(count);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải danh bạ: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Tìm kiếm realtime
  useEffect(() => {
    const timeout = setTimeout(() => loadContacts(query), 300);
    return () => clearTimeout(timeout);
  }, [query, loadContacts]);

  // Xóa liên hệ
  const handleDelete = async (id) => {
    try {
      await deleteContact(id);
      loadContacts(query);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể xóa: ' + err.message);
    }
  };

  // Thêm dữ liệu mẫu (demo Bulk Transaction)
  const handleInsertDemo = async () => {
    try {
      setLoading(true);
      await bulkInsertContacts(DEMO_CONTACTS);
      loadContacts(query);
      Alert.alert('✅ Thành công', `Đã thêm ${DEMO_CONTACTS.length} liên hệ mẫu bằng Transaction!`);
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    }
  };

  // Navigate sang Add/Edit và reload khi quay lại
  const handleAdd = () => onAdd(loadContacts);
  const handleEdit = (contact) => onEdit(contact, loadContacts);

  // ─── Render ──────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📱 Danh Bạ</Text>
          <Text style={styles.headerSub}>{totalCount} liên hệ</Text>
        </View>
        <TouchableOpacity style={styles.demoBtn} onPress={handleInsertDemo}>
          <Ionicons name="flash-outline" size={16} color="#fff" />
          <Text style={styles.demoBtnText}>Demo</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm tên, số điện thoại..."
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Danh sách */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : contacts.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="people-outline" size={64} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>
            {query ? 'Không tìm thấy kết quả' : 'Chưa có liên hệ nào'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {query ? 'Thử tìm kiếm khác' : 'Nhấn "+" để thêm hoặc "Demo" để tạo dữ liệu mẫu'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ContactItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}

      {/* FAB — Nút thêm liên hệ */}
      <TouchableOpacity style={styles.fab} onPress={handleAdd} activeOpacity={0.85}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 5,
  },
  demoBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },

  // Search
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -14,
    marginBottom: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
  },

  // List
  list: { paddingHorizontal: 16, paddingBottom: 100 },

  // Contact Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cardContent: { flex: 1 },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  contactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  contactPhone: { fontSize: 13, color: '#6366F1', fontWeight: '500' },
  contactEmail: { fontSize: 12, color: '#64748B' },
  cardActions: { flexDirection: 'column', gap: 8, marginLeft: 8 },
  editBtn: {
    padding: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  deleteBtn: {
    padding: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },

  // Empty / Loading
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  loadingText: { marginTop: 12, color: '#64748B', fontSize: 14 },
  emptyTitle: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: '700',
    color: '#475569',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    backgroundColor: '#6366F1',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
});
