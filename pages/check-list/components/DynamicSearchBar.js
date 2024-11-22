import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import CmmsColors from '../../../common/CmmsColors';
import { CmmsText, CTextHint, CTextTitle } from '../../../common/components/CmmsText';
import AssetInfoPopUp from '../../components/AssetInfoPopUp';

const DynamicSearchBar = ({
	searchFilterList = [
		
	],
	visibleSearchView = true,
	visibleDrawerRightIcon = false,
	onDrawableRightPress = () => {},
	onItemSelected = () => {},
	isSetSearchText = false,
	titleStyle,
	titleCaptionStyle,
	dispatch

}) => {
	const [ searchText, setSearchText ] = useState('');
	const [ showAssetDropdownList, setshowAssetDropdownList ] = useState(true);
	const [ selectedItem, setSelectedItem ] = useState(searchFilterList.length == 1 ? searchFilterList[0] : null);
	const [ selectedAssetInfoItem, setSelectedAssetInfoItem ] = useState(searchFilterList.length == 1 ? searchFilterList[0] : null);

	const [visibleAssetInfoPopUp, setVisibleAssetInfoPopUp] = useState(false);

	useEffect(() => {
		selectedAssetInfoItem && setVisibleAssetInfoPopUp(prvs=>!prvs)
		
	}, [selectedAssetInfoItem]);

	useEffect(
		() => {
			console.log('DynamicSearchBar', 'UEF: ', selectedItem);
			if (selectedItem) {
				if (isSetSearchText) setSearchText(selectedItem.Asset);
			}
			onItemSelected(selectedItem);
			// setshowAssetDropdownList(selectedItem)
		},
		[ selectedItem ]
	);
	const filterList = useMemo(
		() => {
			console.log('filterAssetList', { searchText });
			if (searchText.length === 0) {
				console.log('usememo');
				return searchFilterList;
			}
			const list = searchFilterList.filter((filterItem) => {
				console.log({ filterItem });
				return filterItem.AssetCode.toLowerCase().includes(searchText.toLowerCase());
			});
			return list;
		},
		[ searchText, searchFilterList ]
	);
	console.log({ searchFilterList, filterList, selectedItem });
	return (
		<View
			style={{
				flex: filterList.length > 1 ? 1 : 0,
				backgroundColor: 'white'
			}}
		>
			{visibleSearchView && (
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						// borderColor:CmmsColors.lightBlue,borderWidth:1,
						// borderWidth: 1,
						backgroundColor: 'white',
						paddingHorizontal: 8,
						borderWidth: 1,
						borderColor: CmmsColors.lightGray
						// marginHorizontal: 8,
						// borderTopRightRadius:25,
						// borderTopLeftRadius:25,
						// borderRadius:filterList.length==0?0:25
					}}
				>
					{/* <TouchableOpacity> */}
					<Icon name="search" size={18} color="grey" />
					{/* </TouchableOpacity> */}
					<TextInput
						// ref={assetIpRef}
						value={searchText}
						placeholder="Asset Code"
						selectTextOnFocus
						style={styles.assetCodeSearchField}
						autoFocus
						onTouchStart={() => !showAssetDropdownList && setshowAssetDropdownList(true)}
						onFocus={(focusE) => {
							// assetIpRef.current.fo;
						}}
						onChangeText={(text) => {
							console.log('onchange asset', text);
							setSearchText(text);
							if (text.length == 0) setSelectedItem(undefined);
						}}
						placeholderTextColor={'#888888'}
					/>
					{visibleDrawerRightIcon &&
					selectedItem && (
						<TouchableOpacity onPress={() => {
							setSelectedAssetInfoItem(selectedItem)
							onDrawableRightPress(selectedItem)}}>
							<Icon name="paperclip" size={24} color="black" />
						</TouchableOpacity>
					)}
				</View>
			)}

			{showAssetDropdownList && (
				<View style={{ flex: filterList.length > 1 ? 1:0 }}>
					<FlatList
						showsVerticalScrollIndicator={false}
						data={filterList}
						keyExtractor={(item, index) => index.toString()}
						renderItem={({ item, index }) => {
							// console.log('renderItem', { item });
							const isEnd = index === item.length - 1;
							return (
								<View
									style={{
										paddingHorizontal: 8,
										borderColor: CmmsColors.lightGray,
										borderBottomWidth: 1,
										paddingVertical: 8,
										marginTop: 5
									}}
								>
									<TouchableOpacity
										style={{
											flexDirection: 'row',
											alignItems: 'center',
											flex: 1,
											// borderColor:CmmsColors.lightBlue,borderWidth:1,
											backgroundColor: 'white'
											// marginTop: 1,
										}}
										// style={styles.listItem}
										onPress={() => {
											if (isSetSearchText) {
												setSelectedItem(item);
												setshowAssetDropdownList(false);
											}
										}}
									>
										<CTextTitle
											style={[{
												// ...styles.assetCodeSearchField,
												flex: 1,
												fontSize: 14,
												textAlignVertical: 'center',
												color: item.Status == 0 ? 'black' : 'green',
												
											},titleStyle]}
										>
											{item.Asset}
										</CTextTitle>

										{visibleDrawerRightIcon && (
											<TouchableOpacity
												style={{ paddingHorizontal: 8, paddingVertical: 4 }}
												onPress={() => {
													setSelectedAssetInfoItem(item)
													onDrawableRightPress(item)}}
											>
												<Icon name={'paperclip'} size={18} color="black" />
											</TouchableOpacity>
										)}
									</TouchableOpacity>
									{item.LocationName && (
										<CmmsText style={[{ fontSize: 12,},titleCaptionStyle ]}>{item.LocationName}</CmmsText>
									)}
								</View>
							);
						}}
					/>
				</View>
			)}
			{visibleAssetInfoPopUp && (
				<AssetInfoPopUp
					dispatch={dispatch}
					AssetRegID={selectedAssetInfoItem.AssetRegID}
					onTouchOutSide={() => setVisibleAssetInfoPopUp(false)}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	assetCodeSearchField: {
		flex: 1,
		fontSize: 16,
		fontFamily: 'sans-serif-condensed',
		fontWeight: 'bold',
		// marginHorizontal:8,
		// padding: 8,
		// paddingLeft: 20,
		// paddingRight: 20,
		// borderRadius: 20,
		borderColor: '#888888',
		fontSize: 14,
		height: 50
	}
});

export default memo(DynamicSearchBar);
