var React = require('react-native');
var Separator = require('./helpers/Separator');
var Checkbox = require('./helpers/Checkbox');
var Icon = require('react-native-vector-icons/MaterialIcons');

var {
  View,
  Text,
  StyleSheet,
  ListView,
  TouchableHighlight
} = React;

var menu = require('./imgs/ic_menu.png');
var search = require('./imgs/ic_search.png');

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  rowWrapper: {
    height: 40,
    padding: 8,
    flexDirection: 'row',
  },
  rowIcon: {
    textAlign: 'left',
    color: 'gray'
  },
  rowText: {
    fontSize: 18,
    flex: 1,
    textAlign: 'left',
  },
  spacer: {
    padding: 5,
    backgroundColor: '#009688'
  },
  label: {
    paddingLeft: 20,
    fontSize: 18,
  },
  checked: {
    color: '#009688'
  },
});

class Filter extends React.Component{
  
  constructor(props){
    super(props)
    this.ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2})
    this.state = {
      newCats: [],
      newTags: [],
      categories: this.ds.cloneWithRows([]),
      tags: this.ds.cloneWithRows([]),
      filters: this.props.filters
    }
  }

  componentDidMount(){
    let filters = this.state.filters;
    let newCats = [];
    this.props.categories.forEach(row => {
      if(filters.category === row.id){
        row.selected = true;
      } else {
        row.selected = false;
      }
      newCats.push(row);
    });
    let newTags = [];
    if(filters.tags.includes(0)){
      this.props.tags.forEach(row => {
        row.checked = true;
        newTags.push(row);
        if(!filters.tags.includes(row.id)){
          filters.tags.push(row.id);
        }
      });
    } else {
      this.props.tags.forEach(row => {
        if(filters.tags.includes(row.id)){
          row.checked = true;
        } else {
          row.checked = false;
        }
        newTags.push(row);
      });
    }
    this.setState({
      newCats: newCats,
      newTags: newTags,
      categories: this.ds.cloneWithRows(newCats),
      tags: this.ds.cloneWithRows(newTags),
    });
  }

  handleCategoryPress(catID){
    let filters = this.state.filters;
    let newData = [];
    this.state.newCats.forEach(row => {
      if(row.id === catID){
        row.selected = true;
      } else {
        row.selected = false;
      }
      newData.push(row);
    });
    filters.category = catID;
    this.setState({
      filters: filters,
      newCats: newData,
      categories: this.ds.cloneWithRows(newData),
    });
    this.props.navigator.pop();
  }

  handleAllTagPress(){
    let filters = this.state.filters;
    let newData = [];
    if(filters.tags.includes(0)){
      this.state.newTags.forEach(row => {
        row.checked = false;
        newData.push(row);
      });
      filters.tags = [];
    } else {
      this.state.newTags.forEach(row => {
        row.checked = true;
        newData.push(row);
        if(!filters.tags.includes(row.id)){
          filters.tags.push(row.id);
        }
      }); 
      filters.tags.push(0);
    }
    this.setState({
      filters: filters,
      newTags: newData,
      tags: this.ds.cloneWithRows(newData),
    });
  }

  handleTagPress(tagID){
    let filters = this.state.filters;
    let newData = [];
    if(filters.tags.includes(tagID)){
      this.state.newTags.forEach(row => {
        if(row.id === tagID){
          row.checked = false;
        }
        newData.push(row);
      });
      filters.tags = filters.tags.filter(tag => tag !== tagID && tag !== 0);
    } else {
      this.state.newTags.forEach(row => {
        if(row.id === tagID){
          row.checked = true;
        }
        newData.push(row);
      });
      filters.tags.push(tagID);
      if(newData.length === filters.tags.length){
        filters.tags.push(0);
      }
    }
    console.log(filters.tags)
    this.setState({
      filters: filters,
      newTags: newData,
      tags: this.ds.cloneWithRows(newData),
    });
  }

  renderCategoryHeader(){
    return(
      <View>
        <TouchableHighlight
          underlayColor={'#80CBC4'}
          onPress={this.handleCategoryPress.bind(this,0)} >
          <View style={[styles.rowWrapper, this.state.filters.category === 0 ? {backgroundColor: '#80CBC4'} : {}]}>
            <Icon 
              style={styles.rowIcon}
              name={'chevron-left'}
              size={25} 
              color={'#2196F3'} />
            <Text style={styles.rowText}>
              All Categories
            </Text>
          </View>
        </TouchableHighlight>  
        <Separator />
      </View>  
    );
  }

  renderCategories(rowData){
    return (
      <TouchableHighlight
        underlayColor={'#80CBC4'}
        onPress={this.handleCategoryPress.bind(this,rowData.id)} >
        <View style={[styles.rowWrapper, rowData.selected ? {backgroundColor: '#80CBC4'} : {}]}>
          <Icon 
            style={styles.rowIcon}
            name={'chevron-left'}
            size={25} 
            color={'#2196F3'} />
          <Text style={styles.rowText}>
            {rowData.name}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }

  renderTagHeader(){
    return(
      <View>
        <Checkbox 
          label='All Tags' 
          checked={this.state.filters.tags.includes(0) ? true : false} 
          labelStyle={styles.label}
          checkedStyle={styles.checked}
          onPress={this.handleAllTagPress.bind(this)} />
        <Separator />
      </View>  
    );
  }

  renderTags(rowData){
    return (
      <View>
        <Checkbox 
          label={rowData.name} 
          checked={rowData.checked} 
          labelStyle={styles.label}
          checkedStyle={styles.checked}
          onPress={this.handleTagPress.bind(this,rowData.id)} />
        <Separator /> 
      </View>  
    );
  }

  render(){
    return(
      <View style={styles.container}>
        <ListView
          dataSource={this.state.categories}
          renderHeader={this.renderCategoryHeader.bind(this)}
          renderRow={this.renderCategories.bind(this)}
          renderSeparator={(sectionID, rowID) => <Separator key={`${sectionID}-${rowID}`} /> } />
        <Separator />
        <View style={styles.spacer} />
        <Separator />
        <ListView
          dataSource={this.state.tags}
          renderHeader={this.renderTagHeader.bind(this)}
          renderRow={this.renderTags.bind(this)}
          renderSeparator={(sectionID, rowID) => <Separator key={`${sectionID}-${rowID}`} /> } />
      </View>
    );
  }

};

module.exports = Filter;