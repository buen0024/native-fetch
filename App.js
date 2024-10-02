import React, {useEffect, useState} from 'react';
import { SafeAreaView, FlatList, View, Text, RefreshControl, Platform, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import UserAvatar from 'react-native-user-avatar';
import axios from 'axios';

const API_URL = 'https://random-data-api.com/api/v2/users?size=10';
const SINGLE_USER_URL = 'https://random-data-api.com/api/v2/users?size=1';

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchNewUser, setIsFetchNewUser] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [msgVisible, setMsgVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get(API_URL)
      .then(response => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(`Error fetching users: ${err}`);
        setLoading(false);
      })
  }

  const fetchOneUser = () => {
    setIsFetchNewUser(true);
    axios.get(SINGLE_USER_URL)
      .then(response => {
        const newUser = response.data;
        if (newUser && newUser.first_name && newUser.last_name && newUser.avatar) {
          setUsers(prevUsers => [newUser, ...prevUsers]);
        } else {
          console.error('Invalid user data:', newUser);
        }
      })
      .catch(err => {
        console.error(`Error fetching new user: ${err}`);
      })
      .finally(() => {
        setIsFetchNewUser(false);
      })
  }

  const onRefresh = async () => {
    setRefresh(true);
    axios.get(API_URL)
      .then(response => {
        setUsers(response.data);
        setMsgVisible(true);
        setTimeout(() => {
          setMsgVisible(false);
        }, 3000);
      })
      .catch(err => console.error(`Error refreshing users: ${err}`))
      .finally(() => { setRefresh(false) })
  }

  const renderItem = ({ item }) => (
  <View style={styles.itemContainer}>
    {Platform.OS === 'android' && (
      //<Image source={{ uri: item.avatar }} style={styles.avatar} />
      <UserAvatar
          size={50}
          name={`${item.first_name} ${item.last_name}`}
          src={item.avatar}
          style={styles.avatar}
        />
    )}
    
    <View style={styles.infoContainer}>
      <Text style={styles.name}>{item.first_name}</Text>
      <Text style={styles.name}>{item.last_name}</Text>
    </View>

    {Platform.OS === 'ios' && (
      //<Image source={{ uri: item.avatar }} style={styles.avatar} />
      <UserAvatar
          size={50}
          name={`${item.first_name} ${item.last_name}`}
          src={item.avatar}
          style={styles.avatar}
        />
    )}
  </View>
  );


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={users}
            //keyExtractor={(item) => item.id.toString()}
            keyExtractor={(item) => (item && item.id ? item.id.toString() : Math.random().toString())}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refresh} onRefresh={onRefresh}></RefreshControl>
            }
          />
        )}

        {msgVisible && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>New users loaded!</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={fetchOneUser}
          disabled={isFetchNewUser}
        >
          <Ionicons name="add-circle-outline" size={50} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  infoContainer: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  id: {
    fontSize: 12,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#6200ea',
    borderRadius: 50,
    padding: 10,
  },
  messageContainer: {
  position: 'absolute',
  top: 10,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(0,0,0,0.7)',
  padding: 15,
  alignItems: 'center',
  zIndex: 1,
},
messageText: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
},
});
