import {Image} from 'react-native';
import React, {useState, useCallback, useEffect} from 'react';
import {GiftedChat, Bubble, Send} from 'react-native-gifted-chat';

export function GiftedChatDemo() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
    ]);
  }, []);

  const onSend = useCallback((messages = []) => {
    messages = messages.map((i) => ({
      ...i,
      image: 'https://github.githubassets.com/favicons/favicon.png',
    }));
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages),
    );
  }, []);

  return (
    <GiftedChat
      alwaysShowSend={true}
      renderActions={() => {
        return (
          <>
            <Image
              style={{
                position: 'absolute',
                right: 100,
                height: 42,
                width: 42,
                borderRadius: 21,
                resizeMode: 'contain',
                marginRight: 8,
                tintColor: 'white',
                backgroundColor: 'red',
              }}
              source={require('../images/camera_icon.png')}
            />
            <Image
              style={{
                position: 'absolute',
                right: 50,
                height: 42,
                width: 42,
                borderRadius: 21,
                resizeMode: 'contain',
                marginRight: 8,
                tintColor: 'red',
              }}
              source={require('../images/camera_icon.png')}
            />
          </>
        );
      }}
      renderSend={(props) => {
        return (
          <Send {...props}>
            <Image
              style={{
                height: 42,
                width: 42,
                resizeMode: 'contain',
                marginRight: 8,
              }}
              source={require('../images/send_icon.png')}
            />
          </Send>
        );
      }}
      renderBubble={(props) => {
        return (
          <Bubble
            {...props}
            wrapperStyle={{
              left: {
                backgroundColor: 'white',
              },
              right: {
                backgroundColor: 'red',
              },
            }}
          />
        );
      }}
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: 1,
      }}
    />
  );
}
