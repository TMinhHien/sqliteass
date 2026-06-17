import { Text, View, StyleSheet } from 'react-native';

export default function AssetExample() {
  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>SQLite Contact Management App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  paragraph: {
    margin: 24,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
