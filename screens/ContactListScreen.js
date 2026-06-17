import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
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
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ─── Nhóm danh bạ theo chữ cái đầu ──────────────────────
const groupContacts = (contacts) => {
  const map = {};
  contacts.forEach((c) => {
    const letter = (c.name[0] || '#').toUpperCase();
    if (!map[letter]) map[letter] = [];
    map[letter].push(c);
  });
  return Object.keys(map)
    .sort()
    .map((letter) => ({ title: letter, data: map[letter] }));
};

// ─── ContactRow ───────────────────────────────────────────
const ContactRow = React.memo(({ item, onPress, isLast }) => (
  <TouchableOpacity
    style={[styles.row, isLast && styles.rowLast]}
    onPress={() => onPress(item)}
    activeOpacity={0.45}
  >
    <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.name) }]}>
      <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
    </View>
    <View style={styles.rowContent}>
      <Text style={styles.rowName}>{item.name}</Text>
      <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
    </View>
  </TouchableOpacity>
));

// ─── Màn hình chính ───────────────────────────────────────
export default function ContactListScreen({ onAdd, onEdit }) {
  const [contacts, setContacts] = useState([]);
  const [query, setQuery]       = useState('');
  const [loading, setLoading]   = useState(true);

  const loadContacts = useCallback(async (q = '') => {
    try {
      const data = q ? await searchContacts(q) : await getAllContacts();
      setContacts(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  useEffect(() => {
    const t = setTimeout(() => loadContacts(query), 300);
    return () => clearTimeout(t);
  }, [query, loadContacts]);

  const sections = useMemo(() => groupContacts(contacts), [contacts]);

  const handleEdit = (contact) => onEdit(contact, loadContacts);
  const handleAdd  = () => onAdd(loadContacts);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header iOS style */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh bạ</Text>
        <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
          <Ionicons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Search bar kiểu iOS */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={15} color="#8E8E93" style={{ marginRight: 6 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm"
          placeholderTextColor="#8E8E93"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={16} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : contacts.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {query ? 'Không tìm thấy liên hệ' : 'Chưa có liên hệ nào'}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          renderItem={({ item, index, section }) => (
            <View style={styles.sectionCard}>
              <ContactRow
                item={item}
                onPress={handleEdit}
                isLast={index === section.data.length - 1}
              />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
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
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.3,
  },
  addBtn: { paddingBottom: 4 },

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

  // Section
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C6C70',
    paddingHorizontal: 20,
    paddingBottom: 4,
    paddingTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 0,
    overflow: 'hidden',
  },
  listContent: { paddingBottom: 40 },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  rowLast: { borderBottomWidth: 0 },
  rowContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowName: { fontSize: 16, color: '#000', fontWeight: '400' },

  // Avatar
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  // Empty / Loading
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#8E8E93', fontSize: 15 },
});
