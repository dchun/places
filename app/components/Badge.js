var React = require('react-native');
var Icon = require('react-native-vector-icons/MaterialIcons');

var {
	Text,
	View,
	Image,
	StyleSheet,
	MapView,
} = React;

var styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingBottom: 10,
		backgroundColor: '#009688',
	},
	map: {
		flex: 1,
		height: 180,
	},
	mapContainer: {
		flex: 1
	},	
	mapEditIcon: {
		position: 'absolute',
		right: 20,
		bottom: 80,
		backgroundColor: 'transparent'
	},
	name: {
		fontSize: 20,
		marginTop: 10,
		marginBottom: 5,
		marginLeft: 10,
		color: 'white'
	},
	handle: {
		fontSize: 16,
		marginLeft: 10,
		color: 'white'
	},
});

class Badge extends React.Component{
	renderEditIcon(){
		if(this.props.place.id){
			return(
				<Icon 
					style={styles.mapEditIcon} 
					color={'gray'} 
					name={'edit-location'} 
					size={35}
					backgroundColor={'#FF8A80'}
					onPress={this.props.onPress} />
			);
		}
	}

	render() {
		return (
			<View style={styles.container}>
				<View style={styles.mapContainer}>
					<MapView 
						style={styles.map}
						region={{
			        latitude: this.props.place.latitude,
			        longitude: this.props.place.longitude,
			        latitudeDelta: 0.0075,
			        longitudeDelta: 0.005
						}}
						annotations={[{
							latitude: this.props.place.latitude,
			        longitude: this.props.place.longitude,
			        draggable: false
						}]}
						showsUserLocation={false}
						followUserLocation={false}
						rotateEnabled={false}
						scrollEnabled={false}
						zoomEnabled={false}
					/>
				</View>
				{this.renderEditIcon()}
				<Text style={styles.name}> Save Place </Text>
				<Text style={styles.handle}> Add Details Below </Text>
			</View>
		);
	}
}

Badge.propTypes = {
	place: React.PropTypes.object.isRequired
}

module.exports = Badge;