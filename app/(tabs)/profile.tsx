import {
  View,
  Text,
  Button,
  StyleSheet,
  SafeAreaView,
  Pressable,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { defaultStyles } from "@/constants/Styles";
import Colors from "@/constants/Colors";
import { Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

const Profile = () => {
  const { signOut, isSignedIn } = useAuth();
  const { user } = useUser();

  const [firstName, setFirstName] = useState(user?.firstName);
  const [lastName, setLastName] = useState(user?.lastName);
  const [email, setEmail] = useState(user?.emailAddresses[0].emailAddress);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.emailAddresses[0].emailAddress);
  }, [user]);

  const onSaveUser = async () => {
    try {
      if (!firstName || !lastName) return;
      await user?.update({
        firstName,
        lastName,
      });
    } catch (error) {
      console.log(error);
    }
    setEdit(false);
  };

  const onCaptureImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.75,
      base64: true,
    });

    if (!result.canceled) {
      const base64 = `data:image/png;base64,${result.assets[0].base64}`;
      user?.setProfileImage({
        file: base64,
      })
    }
  };

  return (
    <SafeAreaView style={defaultStyles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Profile</Text>
        <Ionicons name="notifications-outline" size={26} />
      </View>
      {user && (
        <View style={styles.card}>
          <Pressable onPress={onCaptureImage}>
            <Image style={styles.avatar} source={{ uri: user?.imageUrl }} />
          </Pressable>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {edit ? (
              <View style={styles.editRow}>
                <TextInput
                  placeholder="First Name"
                  value={firstName || ""}
                  onChangeText={(text) => setFirstName(text)}
                  style={[defaultStyles.inputField, { width: 100 }]}
                />
                <TextInput
                  placeholder="Last Name"
                  value={lastName || ""}
                  onChangeText={(text) => setLastName(text)}
                  style={[defaultStyles.inputField, { width: 100 }]}
                />
                <Pressable onPress={onSaveUser}>
                  <Ionicons
                    name="checkmark-outline"
                    size={24}
                    color={Colors.dark}
                  />
                </Pressable>
              </View>
            ) : (
              <View style={styles.editRow}>
                <Text style={{ fontFamily: "mon-b", fontSize: 22 }}>
                  {firstName} {lastName}
                </Text>
                <Pressable onPress={() => setEdit(true)}>
                  <Ionicons
                    name="create-outline"
                    size={24}
                    color={Colors.dark}
                  />
                </Pressable>
              </View>
            )}
            <Text>{email}</Text>
            <Text>Since {user?.createdAt?.toLocaleDateString()}</Text>
          </View>
        </View>
      )}

      {isSignedIn && (
        <Button title="Log Out" onPress={() => signOut()} color={Colors.dark} />
      )}
      {!isSignedIn && (
        <Link href={"/(modals)/login"} asChild>
          <Button title="Log In" color={Colors.dark} />
        </Link>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    padding: 24,
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: 24,
    fontFamily: "mon-b",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginTop: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.grey,
  },
  editRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
  },
});

export default Profile;
