import React, { useContext } from 'react';
import { SafeAreaView, Text } from 'react-native';
import { AppContext } from '../components/ContextProvider';
import { Button } from '../Shared';

const Home = () => {
	const { toggleLogin } = useContext(AppContext);
	return (
		<SafeAreaView
			style={{
				width: '100%',
				flex: 1,
				justifyContent: 'space-between',
				alignItems: 'center',
			}}
		>
			<Text>Home</Text>
			<Button enabled={true} text='logOut' onPress={() => toggleLogin()} />
		</SafeAreaView>
	);
};

export default Home;
