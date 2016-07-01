var React = require('react-native');
var Separator = require('./helpers/Separator');
var Icon = require('react-native-vector-icons/MaterialIcons');
var Checkbox = require('./helpers/Checkbox');
var database = require('../utils/database');
var Swipeout = require('react-native-swipeout');
var Dimensions = require('Dimensions');

var {
  View,
  Text,
  TextInput,
  ListView,
  TouchableHighlight,
  StyleSheet,
  LayoutAnimation,
  DeviceEventEmitter
} = React;

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  listContainer: {
    flexDirection: 'column',
  },
  label: {
    paddingLeft: 20,
    fontSize: 18,
  },
  checked: {
    color: '#009688'
  },
  addTagWrapper: {
    padding: 10,
    flexDirection: 'row',
  },
  addTagLabel: {
    flex: 1,
    textAlign: 'left',
  },
  addTagIcon: {
    textAlign: 'left',
    color: 'gray'
  },
  textField: {
    height: 40,
    padding: 5,
    margin: 5,
    fontSize: 18,
  },
});

class Tags extends React.Component{

  constructor(props){
    super(props)
    this.ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2})
    this.state = {
      tags: this.props.tags,
      placeTags: this.props.placeTags,
      dataSource: this.ds.cloneWithRows([]),
      tagName: '',
      inputVisibility: false,
      keyboardY: undefined
    }
  }

  componentDidMount(){
    DeviceEventEmitter.addListener('keyboardWillShow', this.keyboardWillShow.bind(this))
    DeviceEventEmitter.addListener('keyboardWillHide', this.keyboardWillHide.bind(this))
    
    this.setState({
      dataSource: this.ds.cloneWithRows(this.props.placeTags)
    });
  }

  keyboardWillShow(e) {
    this.setState({keyboardY: e.endCoordinates.screenY})
  }

  keyboardWillHide(e) {
    this.setState({keyboardY: e.endCoordinates.screenY})
  }

  handleCheck(rowData){
    if(rowData.checked != true){
      let newData = this.state.placeTags.map(row => {
        if(row.id == rowData.id){
          row.checked = 1;
        }
        return row;
      });
      this.setState({
        dataSource: this.ds.cloneWithRows(newData),
        placeTags: newData
      });
    } else {
      let newData = this.state.placeTags.map(row => {
        if(row.id == rowData.id){
          row.checked = 0;
        }
        return row;
      });
      this.setState({
        dataSource: this.ds.cloneWithRows(newData),
        placeTags: newData
      });
    }
  }

  handleAddNewTag(){
    this.setState({inputVisibility:true});
    this._input.focus();
  }

  handleSubmit(){
    if(this.state.tagName.length > 0){
      database.createTag(this.state.tagName)
        .then(results => {
          let allTags = this.state.tags;
          allTags.push(results);
          let newData = this.state.placeTags;
          results.checked = 1;
          newData.push(results);
          this.setState({
            dataSource: this.ds.cloneWithRows(newData),
            placeTags: newData,
            tags: allTags,
            inputVisibility:false,
            tagName: ''
          });
        });
      } else {
        this.setState({
          inputVisibility:false,
        });        
      }
  }

  deleteTag(id){
    database.deleteTag(id)
      .then(res => {
        let newData = this.state.placeTags;
        newData.forEach((tag,i) => {
          if(tag.id === res){
            newData.splice(i,1);
          }
        });
        let allTags = this.state.tags.map((tag,i) => {
          if(!tag.id === res){
            return tag;
          }
        });
        LayoutAnimation.easeInEaseOut();
        this.setState({
          dataSource: this.ds.cloneWithRows(newData),
          placeTags: newData,
          tags: allTags,
        });
      }) 
  }

  renderRow(rowData){
    let swipeBtns = [{
      text: 'Delete',
      backgroundColor: 'red',
      underlayColor: 'rgba(0, 0, 0, 0.6)',
      onPress: () => { this.deleteTag(rowData.id) }
    }];

    return (
      <Swipeout right={swipeBtns}
        autoClose='true'
        backgroundColor='transparent'>
        <View>
          <Checkbox 
            label={rowData.name} 
            checked={rowData.checked} 
            labelStyle={styles.label}
            checkedStyle={styles.checked}
            onPress={this.handleCheck.bind(this,rowData)} />
          <Separator /> 
        </View>  
      </Swipeout>
    );
  }

  blurInput(){
    this.setState({inputVisibility:false});
  }

  renderFooter(){
    var visibleInput;
    if(this.state.inputVisibility){
      visibleInput = (
        <View>
          <TextInput
            ref={(c) => {this._input = c}}  
            onChange={(e) => this.setState({tagName:e.nativeEvent.text})}
            onFocus={() => {
              let node = React.findNodeHandle(this._input);
              this._input.measure((fx, fy, width, height, px, py) => {
                if(py >= this.state.keyboardY){
                  this._listView.scrollResponderScrollNativeHandleToKeyboard(node);
                }
              });
            }}
            onBlur={this.blurInput.bind(this)}
            onSubmitEditing={this.handleSubmit.bind(this)}
            style={styles.textField}
            placeholder={'tag name'}
            value={this.state.tagName} />
          <Separator /> 
        </View>
      );
    }
    return (
      <View>
        {visibleInput}
        <TouchableHighlight 
          underlayColor={'#26A69A'}
          onPress={this.handleAddNewTag.bind(this)} >
          <View style={styles.addTagWrapper}>
            <Icon 
              style={styles.addTagIcon}
              name={'add'} 
              size={25} />
            <Text style={[styles.addTagLabel, styles.label]}>Add New Tag</Text>
          </View>        
        </TouchableHighlight>
        <Separator /> 
      </View>  
    );
  }

  render(){
    return(
      <View style={styles.container}>
        <ListView
          ref={(c) => {this._listView = c}}
          keyboardDismissMode={'on-drag'}
          contentContainerStyle={styles.listContainer}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          renderFooter={this.renderFooter.bind(this)} />
      </View>
    );
  }
};

Tags.propTypes = {
  tags: React.PropTypes.array,
};

module.exports = Tags;