var React = require('react-native');
var Icon = require('react-native-vector-icons/MaterialIcons');
var RNLocalSearch = require('react-native-localsearch');
var Separator = require('./helpers/Separator');
var SearchBar = require('react-native-search-bar');
var Place = require('./Place');
var Filter = require('./Filter');
var ControlPanel = require('./ControlPanel');
var database = require('../utils/database');

var {
	View,
	Text,
	StyleSheet,
	MapView,
	Alert,
	TextInput,
	ListView,
	TouchableHighlight,
	TouchableWithoutFeedback,
	Dimensions
} = React;

var styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
		justifyContent: 'center',
	},
	search: {
		position: 'absolute',
    left: 0,
    bottom: 0,
    opacity: 0.8,
    backgroundColor: 'white',
	},
	title: {
		marginBottom: 20,
		fontSize: 25,
		textAlign: 'center',
		color: '#fff'
	},
	mapContainer: {
		flex: 1
	},	
	map: {
		flex: 1,
	},
	iconControls: {
		position: 'absolute',
		backgroundColor: 'transparent',		
	},
  listContainer: {
    flexDirection: 'column',
  },
  rowContainer: {
    padding: 10,
  },
});

var emptyPin = {latitude: 0, longitude: 0};

class Main extends React.Component{
	watchID = (null: ?number);

	constructor(props){
		super(props)
		this.ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2})
		this.state = {
      initialPosition: undefined,
      lastPosition: undefined,
			region: undefined,
			mapRegion: undefined,
      pins: [],
      temporaryPin: emptyPin,
      categories: [],
      tags: [],
			gpsFixed: false,
			zoomedIn: false,
			addingPlace: false,
      searchResults: this.ds.cloneWithRows([]),
      searchBar: false,
      filters: this.props.filters,
      screenWidth:300,
  		navHeight: 65
    }
	}

  componentDidMount(){
  	let route = this.props.navigator.navigationContext.currentRoute;
  	route.onLeftButtonPress = () => {this.handleLeftButtonPress()};
  	route.onRightButtonPress = () => {this.handleRightButtonPress()};
  	this.setLocationData();
  	this.getCategories();
  	this.getTags();
  	let { width, height } = Dimensions.get('window');
  	let top = 64;
  	if(width > height){
  		top = 32;
  	}
  	this.setState({
  		screenWidth:width,
  		navHeight: top
  	});
  }

  componentWillReceiveProps(nextProps){
  	this.setState({
  		addingPlace: false, 
  		temporaryPin: emptyPin
  	});
  	this.getFilteredPlaces(this.state.mapRegion);
  }
  
  componentWillUnmount(){
    navigator.geolocation.clearWatch(this.watchID);
    navigator.geolocation.stopObserving();
    database.closeDatabase();
  }

  handleLeftButtonPress(){
    this.props.navigator.push({
      title: "Sections",
      component: ControlPanel,
			passProps: {
				categories: this.state.categories,
				tags: this.state.tags
			}
    });
  }

  handleRightButtonPress(){
  	if(!this.state.searchBar){
	  	this.clearTemporaryPins();
	    this.setState({searchBar: true});
	    this.refs.searchBar.focus();
  	} else {
	    this.setState({searchBar: false});
  	}
  }

  setLocationData(){
  	navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
        	initialPosition: position,
        	region: {
        		longitude: position.coords.longitude,
        		latitude: position.coords.latitude,
        		latitudeDelta: 0.016,
        		longitudeDelta: 0.01
        	},
        	zoomedIn: true,
        });
      },
      (error) => console.log(error.message),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
    this.watchID = navigator.geolocation.watchPosition(
    	(position) => {
	      this.setState({
	      	lastPosition: position,
	      });
    	},
    	(error) => console.log(error.message),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  }

  getCategories(){
  	database.getCategories()
     .then(res => {
        this.setState({
          categories: res,
        });
      });
  }

  getTags(){
  	database.getTags()
     .then(res => {
        this.setState({
          tags: res,
        });
      });
  }

	getFilteredPlaces(region){
		let distance = (region.latitudeDelta * 110.574);
		database.getFilteredPlaces(region,distance,this.state.filters).then(results => {
			this.processResults(results);
		});
	}

  processResults(results){
		let data = [];
		results.forEach((result,i,array) => {
			let select = false;
			if(this.state.filters.select === result.id){
				select = true;
			}
			let place = {
				id: result.id,
				name: result.name,
	      address: result.address,
	      latitude: result.latitude,
	      longitude: result.longitude,
	      phone: result.phone,
	      note: result.note,
	      category: {
	      	id: result.category_id,
	      	name: result.category_name,
	      	color: result.category_color
	      }
	    };
	    let pin = {
	    	latitude: result.latitude,
	    	longitude: result.longitude,
	    	title: result.name || 'no name',
	    	subtitle: result.address || 'no address',
	    	view: this.starColor(result.category_color || '000000'),
	    	rightCalloutView: this.addPlace(place),
	    	selectAnnotation: select,
	    	onBlur: this.removeSelect.bind(this),
	    	color: result.category_color
	    }
	    data.push(pin);
		});
		let tp = this.state.temporaryPin;
		if(tp.title){
			data.push(tp);
		}
		this.setState({pins:data});
  }

	starColor(color){
		return(
			<Icon
				onPress={this.clearTemporaryPins.bind(this)} 
				name={'star'}
				size={20} 
				color={'#'+color} />
		);
	}

	clearTemporaryPins(){
		let pins = this.state.pins;
		let oldPins = pins.filter(pin => !pin.notSaved);
		this.setState({
			temporaryPin: emptyPin,
			pins: oldPins,
			addingPlace: false,
		});
	}

  onRegionChangeComplete(region){
  	this.setState({mapRegion: region});
  	this.getFilteredPlaces(region);
	  if(this.state.lastPosition){
	  	if((region.latitude.toFixed(3) === this.state.lastPosition.coords.latitude.toFixed(3)) &&
	  		(region.longitude.toFixed(3) === this.state.lastPosition.coords.longitude.toFixed(3))){
	  		this.setState({
	  			gpsFixed: true,
	  		});
			} else {
				this.setState({
					gpsFixed: false,
				});
			}
		}
	}

	handleGetPlace(){
		if(this.state.lastPosition !== undefined) {
	  	lp = this.state.lastPosition.coords
	  	this.setState({region: undefined});
		  this.setState({
		  	region: {
		  		latitude: lp.latitude,
		  		longitude: lp.longitude,
		  	},
		  });
		} else {
			Alert.alert('Location Unavailable', 'Ensure that this app has access to your location.')
		}
	}

	handleGetPlaceDeltaToggle(){
		if(this.state.lastPosition) {
	  	lp = this.state.lastPosition.coords
	  	this.setState({region: undefined});
	  	if(this.state.zoomedIn === true){
			  this.setState({
			  	region: {
			  		latitude: lp.latitude,
			  		longitude: lp.longitude,
			  		latitudeDelta: 0.08,
			  		longitudeDelta: 0.05
			  	},
			  	zoomedIn: false,
			  });				
			} else {
			  this.setState({
			  	region: {
			  		latitude: lp.latitude,
			  		longitude: lp.longitude,
			  		latitudeDelta: 0.016,
			  		longitudeDelta: 0.01
			  	},
			  	zoomedIn: true,
			  });				
			}
		} else {
			Alert.alert('Location Unavailable', 'Ensure that this app has access to your location.')
		}
  }

  handleAddPlace(){
  	let pins = this.state.pins;
  	let latitude = this.state.mapRegion.latitude;
  	let longitude = this.state.mapRegion.longitude;
	  if(this.state.addingPlace){
  		this.clearTemporaryPins();
		} else {
			let newPin = {
	  		latitude: latitude,
	  		longitude: longitude,
	  		title: 'Add Place',
	  		subtitle: 'Move the map to add precise location',
	  		animateDrop: true,
	  		selectAnnotation: true,
	  		onBlur: this.removeSelect.bind(this),
	  		rightCalloutView: this.addPlace({latitude:latitude,longitude:longitude}),
	  		notSaved: true
	  	}
	  	let newPins = pins.filter(pin => !pin.notSaved).concat(newPin);
		  this.setState({
		  	temporaryPin: newPin,
		  	addingPlace: true,
		  	pins: newPins
		  });			
		}
	}

	addPlace(place){
		return(
			<Icon 
				name={'chevron-right'}
				size={30} 
				color={'#2196F3'}
				onPress={this.goToAddPlace.bind(this, place)} />
		);
	}

	removeSelect(){
		let filters = this.state.filters;
		filters.select = 0;
		let pin = this.state.temporaryPin;
		if(pin.title){
			pin.animateDrop = false;
			pin.selectAnnotation = false;
		}
		this.setState({
			filters: filters,
			temporaryPin: pin
		});
	}

	goToAddPlace(place){
		this.props.navigator.push({
			title: 'Place',
			component: Place,
			passProps: {
				place: place,
				categories: this.state.categories,
				tags: this.state.tags,
				filters: this.state.filters,
				ref: (component) => {this.pushedComponent = component},
			},
			rightButtonTitle: 'Save',
			onRightButtonPress: () => { 
				this.pushedComponent && this.pushedComponent.handleSubmit();
			}
		});
	}

	handleFilter(){
		this.props.navigator.push({
			title: 'Filter',
			component: Filter,
			passProps: {
				categories: this.state.categories,
				tags: this.state.tags,
				filters: this.state.filters,
			}
		});	
	}

  renderSearch(){
  	return(
  		<View style={[styles.search,{width:this.state.screenWidth,top:this.state.navHeight}]}>
		    <SearchBar
		      ref='searchBar'
		      placeholder='Search'
		      onChangeText={text => {
		      	if(text.length >= 2){
			        RNLocalSearch.searchForLocations(text, this.state.mapRegion, (err, resp) => {
			        	if(resp) {
			        		console.log(resp)
			        		this.setState({searchResults: this.ds.cloneWithRows(resp)});
			        	} else if(err) {
			        		this.setState({searchResults: this.ds.cloneWithRows([{title:'not found',name:'try adding it'}])});
			        	}
			        });
			      } else {
			      	this.setState({searchResults: this.ds.cloneWithRows([])});
			      }
		      }}
		      onSearchButtonPress={() => this.refs.searchBar.blur()} />
		    <ListView
		      contentContainerStyle={styles.listContainer}
		      dataSource={this.state.searchResults}
		      renderRow={this.renderSearchResults.bind(this)}
		      automaticallyAdjustContentInsets={false} />
	    </View>
  	);
  }

  renderSearchResults(rowData){
    return (
    	<TouchableHighlight onPress={this.rowPressed.bind(this, rowData.location, rowData.name, rowData.title, rowData.phoneNumber)}>
	      <View>
	        <View style={styles.rowContainer}>
	          <Text> {rowData.title} </Text>
	          <Text> {rowData.name} </Text>
	        </View>
	        <Separator />
	      </View>
      </TouchableHighlight>
    );
  }

	rowPressed(location, name, title, phoneNumber){
		let pins = this.state.pins;
		let place = {
			name: name,
      address: title,
      latitude: location.latitude,
      longitude: location.longitude,
      phone: phoneNumber
    };
    let newPin = {
    	latitude: location.latitude,
    	longitude: location.longitude,
  		title: name,
  		subtitle: `${title}\n${phoneNumber}`,
  		animateDrop: true,
  		selectAnnotation: true,
      rightCalloutView: this.addPlace(place),
      onBlur: this.removeSelect.bind(this),
      notSaved: true
    }
    // let newPins = pins.filter(pin => !pin.notSaved).concat(newPin);
    this.setState({
			searchResults: this.ds.cloneWithRows([]),
			searchBar: false,
    	temporaryPin: newPin,
			region: {
	  		latitude: location.latitude,
	  		longitude: location.longitude
	  	},
	  	// pins: newPins
	  });
	}

	removeSearch(){
		if(this.state.searchBar){
	    this.refs.searchBar.blur();
	    this.setState({
	    	searchResults: this.ds.cloneWithRows([]),
	    	searchBar: false
	    });
		}
	}

	render(){
		return (
			<View 
				style={styles.mainContainer}
				onLayout={(e) => {
					let dim = e.nativeEvent.layout;
					let top = dim.width > dim.height ? 32 : 64;
					this.setState({
						screenWidth: dim.width,
						navHeight: top
					});
				}}>
				<TouchableWithoutFeedback
					onPress={this.removeSearch.bind(this)}>
					<View style={styles.mapContainer}>
						<MapView 
							style={styles.map}
							region={this.state.region}
							annotations={this.state.pins}
							showsUserLocation={true}
							onRegionChangeComplete={this.onRegionChangeComplete.bind(this)} 
						/>
					</View>
				</TouchableWithoutFeedback>
	      {this.state.searchBar ? this.renderSearch() : null}
     		<Icon 
					style={[styles.iconControls, {bottom: 20, left: 20}]} 
					name={this.state.addingPlace ? 'remove-circle-outline' : 'add-circle-outline'}
					size={40} 
					color={this.state.addingPlace ? '#2196F3' : '#757575'}
					onPress={this.handleAddPlace.bind(this)} />
     		<Icon 
					style={[styles.iconControls, {bottom: 70, right: 20}]} 
					name={'filter-list'}
					size={40} 
					color={'#757575'}
					onPress={this.handleFilter.bind(this)} />
				<TouchableWithoutFeedback
				  onPress={this.handleGetPlace.bind(this)} 
          onLongPress={this.handleGetPlaceDeltaToggle.bind(this)}>
					<Icon 
						style={[styles.iconControls, {bottom: 20, right: 20}]} 
						name={(this.state.gpsFixed && this.state.zoomedIn) ? 'center-focus-strong' : (this.state.gpsFixed && !this.state.zoomedIn) ? 'center-focus-weak' : 'crop-free'}
						size={40}
						color={this.state.gpsFixed ? '#2196F3' : '#757575'} />
				</TouchableWithoutFeedback>
			</View>
		);
	}
};

Main.propTypes = {
  region: React.PropTypes.shape({
  	latitude: React.PropTypes.number.isRequired,
  	longitude: React.PropTypes.number.isRequired,
  	latitudeDelta: React.PropTypes.number,
  	longitudeDelta: React.PropTypes.number,
	})
};

module.exports = Main;