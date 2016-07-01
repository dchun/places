var React = require('react-native');
var Badge = require('./Badge');
var Tags = require('./Tags');
var Separator = require('./helpers/Separator');
var Icon = require('react-native-vector-icons/MaterialIcons');
var database = require('../utils/database');
var Category = require('./Category');

var {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableHighlight,
  Alert,
  PickerIOS,
  DeviceEventEmitter
} = React;

var PickerItemIOS = PickerIOS.Item;

var menu = require('./imgs/ic_menu.png');
var search = require('./imgs/ic_search.png');

var styles = StyleSheet.create({
	container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
	},
  badgeContainer: {
    flex: 3,
  },
  fieldsContainer: {
    flex: 5,
  },
	textContainer: {
    padding: 10,
    flexDirection: 'row',
  },
  textAreaContainer: {
    padding: 10,
    flexDirection: 'row',
  },
  textField: {
    paddingLeft: 10,
  	textAlign: 'left',
  	fontSize: 18,
    height: 25,
    flex: 1
  },
  textAreaField: {
    paddingLeft: 10,
    textAlign: 'left',
    fontSize: 18,
    height: 50,
    flex: 1
  },
  iconField: {
  	textAlign: 'left',
    color: 'gray'
  },
  deleteContainer: {
    backgroundColor: '#F44336',
  },
  deleteText: {
    fontSize: 20,
    marginTop: 10,
    marginBottom: 10,
    color: 'white',
    textAlign: 'center'
  }
});


class Place extends React.Component{
  
  constructor(props){
    super(props)
    this.state = {
      id: this.props.place.id,
      name: this.props.place.name,
      address: this.props.place.address,
      latitude: this.props.place.latitude,
      longitude: this.props.place.longitude,
      phone: this.props.place.phone,
      note: this.props.place.note,
      category: {
        id: this.props.place.category_id, 
        name: this.props.place.category_name,
        color: this.props.place.category_color
      },
      categories: this.props.categories,
      tags: this.props.tags,
      placeTags: [],
      filters: this.props.filters,
      keyboardY: undefined,
      pickerVisibility: false
    }
  }

  componentDidMount(){
    let route = this.props.navigator.navigationContext.currentRoute;
    route.onRightButtonPress =  () => {this.handleSubmit()};
    this.props.navigator.replace(route);

    this.keyboardShowListener = DeviceEventEmitter.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
    this.keyboardHideListener = DeviceEventEmitter.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));

    if(this.props.place.id){
      this.getPlaceRelations(); 
    } else {
      this.getRelations();
    }
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeAllListeners();
  }

  keyboardWillShow(e) {
    this.setState({keyboardY: e.endCoordinates.screenY})
  }

  keyboardWillHide(e) {
    this.setState({keyboardY: e.endCoordinates.screenY})
  }

  getPlaceRelations(){
    database.getPlace(this.props.place.id)
     .then(res => {
        this.setState({
          category: {
            id: res.category_id,
            name: res.category_name,
            color: res.category_color
          }
        });
      });
    database.getPlaceTags(this.props.place.id)
     .then(res => {
        this.setState({
          placeTags: res
        });
      }); 
  }

  getRelations(){ 
    database.getTags()
     .then(res => {
        this.setState({
          placeTags: res,
          category: {
            name: 'select category'
          }
        });
      }); 
  }

  inputFocused (refName, offset=0) {
    this.refs[refName].measure((fx, fy, width, height, px, py) => {
      if(py >= this.state.keyboardY){
        let node = React.findNodeHandle(this.refs[refName]);
        this._scrollView.scrollResponderScrollNativeHandleToKeyboard(node,offset);
      }
    });
  }

  handleGetCategory(){
    if(this.state.pickerVisibility){
      if(this.state.category.id === 0){
        this.props.navigator.push({
          title: 'New',
          component: Category,
          passProps: {
            categories: this.state.categories,
            category: this.state.category,
            ref: (component) => {this.pushedComponent = component},
          },
          rightButtonTitle: 'Save',
          onRightButtonPress: () => { 
            this.pushedComponent && this.pushedComponent.handleSubmit();
          }
        });  
      }
      this.setState({pickerVisibility:false})
    } else {
      this.setState({pickerVisibility:true})
    }
  }

  handleGetTag(){
    this.props.navigator.push({
      title: 'Tags',
      component: Tags,
      passProps: {
        tags: this.state.tags,
        placeTags: this.state.placeTags
      },
    });
  }

  handleTagDisplay(){
    let arr = this.state.placeTags.filter(item => {
      return item.checked == true
    });
    if(arr.length < 1){
      return 'add tags';
    } else {
      return arr.map(item => item.name).join(', ');
    }
  }

  handleSubmit(){
    let tags = [];

    if(this.state.placeTags){
      tags = this.state.placeTags.filter(tag => {
        if(tag.checked == true || tag.tag_relation_id){
          return tag;
        } 
      });
    } else {
      tags = null;
    }

    let data = {
      id: this.state.id,
      name: this.state.name,
      address: this.state.address,
      latitude: this.state.latitude.toFixed(6),
      longitude: this.props.place.longitude.toFixed(6),
      phone: this.state.phone,
      note: this.state.note,
      category: this.state.category,
      tags: tags,
    }  

    if(this.state.name && !this.state.id){
      database.createPlace(data)
       .then(res => {
          this.adjustFilters(res[0].insertId,tags);
        });
    } else if(this.state.name && this.state.id) {
      database.updatePlace(data)
       .then(res => {
          this.adjustFilters(this.state.id,tags);
        });      
    } else {
      Alert.alert('Name is required', 'The name field is the only required field')
    }
  }

  adjustFilters(selectID,tags){
    let filters = this.state.filters
    filters.select = selectID;
    if(filters.category !== 0 || !filters.tags.includes(0)){
      Alert.alert(
        'Main Filters Active', 
        'Reset filters so you can view saved place on map?',
        [
          {text: 'No', onPress: () => {
            this.setState({filters:filters});
            this.props.navigator.pop();         
          }},
          {text: 'Yes', onPress: () => {
            filters.category = 0;
            filters.tags = [0];
            this.setState({filters:filters});
            this.props.navigator.pop();
          }},
        ]
      )
    } else {
      this.setState({filters:filters});
      this.props.navigator.pop();
    }
  }

  deletePlace(){
    database.deletePlace(this.props.place.id)
     .then(res => {
        this.props.navigator.pop();
      });
  }

  renderArray(type){
    let arr = this.state[type].map(item => {
      if(item.checked){
        return item.name;
      }
    }).filter(Boolean)
    .join(', ');
    return arr ? arr : type;
  }

  renderCategoryPicker(){
    if(this.state.pickerVisibility){
      return (
        <PickerIOS
          selectedValue={this.state.category.id}
          onValueChange={(id) => {
            if(id !== null){
              let selectedName;
              if(id === 0){
                selectedName = 'New Category';
              } else {
                let selected = this.state.categories.filter(cat => cat.id === id);
                selectedName = selected[0].name;
              }
              this.setState({
                category: {
                  id: id, 
                  name: selectedName
                }
              });
            }
          }}>
          <PickerItemIOS
            key={0}
            label={'select category'} />
          {this.state.categories.map((category) => (
            <PickerItemIOS
              key={category.id}
              value={category.id}
              label={category.name} />
          ))}
          <PickerItemIOS
            key={this.state.categories.length + 1}
            value={0}
            label={'New Category'} />
        </PickerIOS>
      );
    }
  }

	render(){
		return(
			<ScrollView 
        style={styles.container} 
        ref={(c) => {this._scrollView = c}}
        keyboardShouldPersistTaps={true}
        keyboardDismissMode='on-drag'>
        <Badge 
          style={styles.badgeContainer}
          place={{id: this.state.id, latitude: this.state.latitude, longitude: this.state.longitude}}
          onPress={() => {
            Alert.alert(
              'Delete Place', 
              'Are you sure you want to delete this place?',
              [
                {text: 'Cancel'},
                {text: 'OK', onPress: this.deletePlace.bind(this)},
              ]
            )
          }} />
        <View style={styles.fieldsContainer}>
          <View style={styles.textContainer}>
            <Icon style={styles.iconField} name={'text-format'} size={25} />
            <TextInput
              ref='name' 
              onFocus={this.inputFocused.bind(this, 'name', 10)}
              onChangeText={(text) => this.setState({name:text})}
              onSubmitEditing={(e) => {this.refs.address.focus()}}
              style={styles.textField}
              selectTextOnFocus={true}
              placeholder={'name'}
              value={this.state.name} />
          </View>
          <Separator />
          <View style={styles.textContainer}>
            <Icon style={styles.iconField} name={'home'} size={25} />
            <TextInput
              ref='address' 
              onFocus={this.inputFocused.bind(this, 'address', 10)}          
              onChangeText={(text) => this.setState({address:text})}
              onSubmitEditing={(e) => {this.refs.phone.focus()}}
              style={styles.textField}
              placeholder={'address'}
              value={this.state.address} />
          </View>
          <Separator />
          <View style={styles.textContainer}>
            <Icon style={styles.iconField} name={'phone'} size={25} />
            <TextInput
              style={styles.textField}
              ref='phone' 
              onFocus={this.inputFocused.bind(this, 'phone', 10)}
              onChangeText={(text) => this.setState({phone:text})}
              onSubmitEditing={(e) => {this.handleGetCategory()}}
              keyboardType={'phone-pad'}
              placeholder={'phone'}
              value={this.state.phone} />
          </View>
          <Separator />
          <TouchableHighlight 
            underlayColor={'#26A69A'}
            onPress={this.handleGetCategory.bind(this)}>
            <View style={styles.textContainer}>
              <Icon style={styles.iconField} name={'sort'} size={25} />
              <Text style={styles.textField}> 
                {this.state.category.name} 
              </Text>
            </View>
          </TouchableHighlight>
          <Separator />
          {this.renderCategoryPicker()}
          <TouchableHighlight 
            underlayColor={'#26A69A'}
            onPress={this.handleGetTag.bind(this)}>
            <View style={styles.textContainer}>
              <Icon style={styles.iconField} name={'label'} size={25} />
              <Text style={styles.textField}> 
                {this.handleTagDisplay()} 
              </Text>
            </View>
          </TouchableHighlight>          
          <Separator />  
          <View style={styles.textAreaContainer}>
            <Icon style={styles.iconField} name={'note-add'} size={25} />
            <TextInput
              ref='note' 
              style={styles.textAreaField}
              multiline={true}
              maxLength = {200}
              onFocus={this.inputFocused.bind(this, 'note', 25)}
              onChangeText={(text) => this.setState({note:text})}
              placeholder={'note'}
              value={this.state.note} />
          </View>
        </View>
      </ScrollView>
		);
	}

};

module.exports = Place;