import { styled } from "styled-components";
import { auth, db, storage } from "../fireabase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import {
  query,
  collection,
  orderBy,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;

const AvatarUpload = styled.label`
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    width: 50px;
  }
`;

const AvatarImg = styled.img`
  width: 100%;
`;

const AvatarInput = styled.input`
  display: none;
`;

const Name = styled.span`
  font-size: 22px;
`;

const NameInput = styled.input`
  font-size: 22px;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  background-color: transparent;
  color: white;
  width: 100%;
  &:focus {
    outline: none;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Tweets = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const EditNameButton = styled.button`
  margin-left: 10px;
  background-color: #1d9bf0;
  color: white;
  font-weight: 600;
  border: none;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;
const EditNameButtonImg = styled.img`
  width: 15px;
  height: 15px;
`;

const SaveButton = styled.button`
  background-color: #1d9bf0;
  color: white;
  font-weight: 600;
  border: none;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;

export default function Profile() {
  const user = auth.currentUser;
  const [avatar, setAvatar] = useState(user?.photoURL);
  const [tweets, setTweets] = useState<ITweet[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.displayName ?? "Anonymous");
  const onAvartarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!user || !files) {
      return;
    }
    if (files && files.length === 1) {
      const file = files[0];
      const locationRef = ref(storage, `avatars/${user?.uid}`);
      const result = await uploadBytes(locationRef, file);
      const avatarUrl = await getDownloadURL(result.ref);
      setAvatar(avatarUrl);
      await updateProfile(user, {
        photoURL: avatarUrl,
      });
    }
  };
  const fetchTweet = async () => {
    const tweetQuery = query(
      collection(db, "tweets"),
      where("userId", "==", user?.uid),
      orderBy("createdAt", "desc"),
      limit(25)
    );
    const snapshot = await getDocs(tweetQuery);
    const tweets = snapshot.docs.map((doc) => {
      const { tweet, createdAt, userId, username, photo } = doc.data();
      return {
        tweet,
        createdAt,
        userId,
        username,
        photo,
        id: doc.id,
      };
    });
    setTweets(tweets);
  };
  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(e.target.value);
  };
  const onNameSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !editName) {
      return;
    }
    setIsSaving(true);
    await updateProfile(user, {
      displayName: editName,
    });
    setIsSaving(false);
    setIsEditing(false);
  };
  const onEditClick = () => {
    setIsEditing(true);
  };
  useEffect(() => {
    fetchTweet();
  }, []);
  return (
    <Wrapper>
      <AvatarUpload htmlFor="avartar">
        {avatar ? (
          <AvatarImg src={avatar} />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <AvatarImg />
      </AvatarUpload>
      <AvatarInput
        onChange={onAvartarChange}
        id="avartar"
        type="file"
        accept="image/*"
      />
      {isEditing ? (
        <Form onSubmit={onNameSave}>
          <NameInput type="text" onChange={onNameChange} value={editName} />
          <SaveButton type="submit">
            {isSaving ? "Saving.." : "Save"}
          </SaveButton>
        </Form>
      ) : (
        <Name>
          {user?.displayName ? user.displayName : "Anonymous"}
          <EditNameButton onClick={onEditClick}>
            <EditNameButtonImg src="/public/edit.svg" />
          </EditNameButton>
        </Name>
      )}

      <Tweets>
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </Tweets>
    </Wrapper>
  );
}
