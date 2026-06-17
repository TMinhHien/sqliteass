import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllContacts, searchContacts, deleteContact } from '../database/contactsDAO';

// ─── Avatar màu theo chữ cái ─────────────────────────────
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
  if (parts.length === 1) return (parts[0][0] || '?').toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ─── Chuyển danh sách phẳng → [{type:'header'|'item', ...}] ─
const buildRows = (contacts) => {
  const result = [];
  let lastLetter = null;
  contacts.forEach((c, i) => {
    const letter = (c.name[0] || '#').toUpperCase();
    if (letter !== lastLetter) {
      result.push({ type: 'header', id: `h_${letter}`, title: letter });
      lastLetter = letter;
    }
    // Kiểm tra xem có phải item cuối trong nhóm không
    const nextContact = contacts[i + 1];
    const nextLetter = nextContact ? (nextContact.name[0] || '#').toUpperCase() : null;
    result.push({ type: 'item', isLast: letter !== nextLetter, ...c });
  });
  return result;
};

// ─── ContactRow ───────────────────────────────────────────
const ContactRow = React.memo(({ item, onPress, isLast }) => (
  <TouchableOpacity
    style={[styles.row, !isLast && styles.rowBorder]}
    onPress={() => onPress(item)}
    activeOpacity={0.45}
  >
    <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.name) }]}>
      <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
    </View>
    <View style={styles.rowRight}>
      <Text style={styles.rowName}>{item.name}</Text>
      <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
    </View>
  </TouchableOpacity>
));

// ─── Màn hình danh bạ ─────────────────────────────────────
export default function ContactListScreen({ onAdd, onEdit }) {
  const [contacts, setContacts] = useState([]);
  const [query, setQuery]       = useState('');
  const [loading, setLoading]   = useState(true);

  const loadContacts = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const data = q ? await searchContacts(q) : await getAllContacts();
      setContacts(data ?? []);
    } catch (e) {
      Alert.alert('Lỗi database', String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load lần đầu
  useEffect(() => { loadContacts(); }, [loadContacts]);

  // Tìm kiếm debounce 300ms
  useEffect(() => {
    const t = setTimeout(() => loadContacts(query), 300);
    return () => clearTimeout(t);
  }, [query, loadContacts]);

  const rows = useMemo(() => buildRows(contacts), [contacts]);

  const handleEdit = (contact) => onEdit(contact, loadContacts);
  const handleAdd  = () => onAdd(loadContacts);

  const renderRow = ({ item }) => {
    if (item.type === 'header') {
      return <Text style={styles.sectionHeader}>{item.title}</Text>;
    }
    // Đầu nhóm: mở card (borderRadius top)
    // Cuối nhóm: đóng card (borderRadius bottom)
    return (
      <View style={[
        styles.card,
        item.isLast && styles.cardLast,
      ]}>
        <ContactRow item={item} onPress={handleEdit} isLast={item.isLast} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh bạ</Text>
        <TouchableOpacity onPress={handleAdd} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="add" size={30} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={15} color="#8E8E93" style={{ marginRight: 6 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm"
          placeholderTextColor="#8E8E93"
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={16} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Nội dung */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : contacts.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="person-outline" size={56} color="#C7C7CC" />
          <Text style={styles.emptyText}>
            {query ? 'Không tìm thấy liên hệ' : 'Chưa có liên hệ nào'}
          </Text>
          {!query && (
            <Text style={styles.emptyHint}>Nhấn "+" để thêm liên hệ mới</Text>
          )}
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id ? String(item.id) : item.id}
          renderItem={renderRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 34, fontWeight: '700', color: '#000' },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#000' },

  // Section header
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C6C70',
    paddingHorizontal: 20,
    paddingBottom: 4,
    paddingTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Card (nhóm liên hệ cùng chữ cái)
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  cardLast: {
    marginBottom: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  rowRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowName: { fontSize: 16, color: '#000' },

  // Avatar
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  // Empty / loading
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyText: { color: '#3C3C43', fontSize: 16, fontWeight: '500' },
  emptyHint: { color: '#8E8E93', fontSize: 13 },

  listContent: { paddingBottom: 40 },
});
