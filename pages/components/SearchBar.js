import React, { useEffect, useState } from 'react';
import {
	StyleSheet,
	Text,
	TextInput,
	View,
	FlatList,
	TouchableOpacity,
	Modal,
	Keyboard,
	Button,
	Pressable
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
// import AutocompleteInput from "react-native-autocomplete-input";
import Icon from 'react-native-vector-icons/FontAwesome';

const SearchBar = (props) => {
	console.log('SearchBar', { props });
	const [ actList, setActList ] = useState([]);
	const [ query, setQuery ] = useState('');
	const [ selectedItem, setSelectedItem ] = useState(undefined);

	useEffect(
		() => {
			if (query != '') setActList(props.list.filter((act) => act.AssetCode.includes(query)));
			// else setActList(props.list)
		},
		[ query ]
	);

	return (
		<View style={styles.mainContainer}>
			<View style={styles.inputContainer}>
				<Icon name="search" size={20} color="grey" style={{ marginLeft: 8 }} />
				{/* <AutocompleteInput
        inputContainerStyle={{borderWidth:0,marginStart:5}}
      data={actList}
      value={query}
      onChangeText={(text) => setQuery(text)}
      flatListProps={{
        keyExtractor: (_, idx) => idx,
        renderItem: ({ item }) => <Text>{item.Asset} {item.AssetCode}</Text>,
      }}
    /> */}
				<TextInput
					style={styles.input}
					placeholder={props.placeholderText || 'Search'}
					value={props.searchPhrase}
					onChangeText={props.setSearchPhrase}
					onFocus={() => {
						props.setClicked(true);
					}}
				/>
			</View>

			<FlatList
				style={styles.listContainer}
				data={Array(10)}
				keyExtractor={(item, index) => index.toString()}
				renderItem={(item, index) => (
					<TouchableOpacity
						style={styles.listItem}
						onPress={() => {
							setSelectedItem(item);
						}}
					>
						<Text>
							{selectedItem?.Asset} {index}
						</Text>
					</TouchableOpacity>
				)}
			/>
		</View>
	);
};

export default SearchBar;

const styles = StyleSheet.create({
	mainContainer: {
    position:'relative',
   marginHorizontal:8
   
	},
	inputContainer: {
		height: 50,
		marginTop: 8,
		// margin: 15,
		flexDirection: 'row',
		alignItems: 'center',
		elevation: 5,
		backgroundColor: 'white'

		// width: "90%",
	},

	input: {
		fontSize: 16,
		marginStart: 5,
		padding: 8
		// width: "90%",
	},
  listContainer:{
    position:'relative'
  },

	listItem: {
		backgroundColor: 'white',
		marginTop: 1,
		flex: 1,
		// borderWidth: 1,
		fontSize: 16,
		padding: 8
	}
});
