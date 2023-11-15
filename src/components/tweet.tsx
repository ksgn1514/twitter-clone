import { styled } from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../fireabase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { useState } from "react";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;

const Column = styled.div``;

const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`;

const ButtonWrapper = styled.div`
  width: 70%;
  height: 40px;
  font-size: 16px;
  display: block;
`;

const DeleteButton = styled.button`
  margin-right: 10px;
  background-color: tomato;
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

const EditButton = styled.button`
  background-color: navy;
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

const SaveButton = styled.input`
  margin-right: 10px;
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

const CancelButton = styled.button`
  margin-right: 10px;
  background-color: tomato;
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

const TextArea = styled.textarea`
  border: 1px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 70%;
  resize: none;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  &::placeholder {
    font-size: 16px;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;
const EditFileButton = styled.label`
  margin-right: 10px;
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

const EditFileInput = styled.input`
  display: none;
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const user = auth.currentUser;

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [editedTweet, setEditedTweet] = useState("");
  const [editedFile, setEditedFile] = useState<File | null>(null);

  const currentDoc = doc(db, "tweets", id);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedTweet(e.target.value);
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const limit = 1024 * 1024 * 5; // 5MB
    const { files } = e?.target;
    if (files && files.length === 1 && files[0].size < limit) {
      setEditedFile(files[0]);
    }
  };

  const onDelete = async () => {
    const ok = confirm("Are you sure you want to delete this tweet?");
    if (!ok || user?.uid !== userId) {
      return;
    }
    try {
      await deleteDoc(doc(db, "tweets", id));
      if (photo) {
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.log(e);
    } finally {
    }
  };

  const onEdit = () => {
    setIsEditing(true);
  };

  const onCancel = () => {
    setIsEditing(false);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || isLoading || editedTweet === "" || editedTweet.length > 200) {
      return;
    }
    try {
      setLoading(true);
      await updateDoc(currentDoc, {
        tweet: editedTweet,
      });
      if (editedFile) {
        const locationRef = ref(storage, `tweets/${user.uid}/${currentDoc.id}`);
        const result = await uploadBytes(locationRef, editedFile);
        const url = await getDownloadURL(result.ref);

        await updateDoc(currentDoc, {
          photo: url,
        });
      }
      setEditedTweet("");
      setEditedFile(null);
      setIsEditing(false);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Wrapper>
      {!isEditing ? (
        <Column>
          <Username>{username}</Username>
          <Payload>{tweet}</Payload>
          {user?.uid === userId ? (
            <ButtonWrapper>
              <DeleteButton onClick={onDelete}>Delete</DeleteButton>
              <EditButton onClick={onEdit}>Edit</EditButton>
            </ButtonWrapper>
          ) : null}
        </Column>
      ) : (
        <Column>
          <Form onSubmit={onSubmit}>
            <TextArea
              required
              rows={5}
              maxLength={200}
              onChange={onChange}
              placeholder={tweet}
              value={editedTweet}
            />
            <ButtonWrapper>
              <SaveButton
                type="submit"
                value={isLoading ? "Saving..." : "Save"}
              />
              <EditFileButton htmlFor="file">
                {editedFile ? "Photo edited✅" : "Edit photo"}
              </EditFileButton>
              <EditFileInput
                onChange={onFileChange}
                id="file"
                type="file"
                accept="image/*"
              />
              <CancelButton onClick={onCancel}>Cancel</CancelButton>
            </ButtonWrapper>
          </Form>
        </Column>
      )}

      <Column>{photo ? <Photo src={photo} /> : null}</Column>
    </Wrapper>
  );
}
