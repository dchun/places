var React = require('react-native');
var Category = require('./Category');
var Icon = require('react-native-vector-icons/MaterialIcons');
var Separator = require('./helpers/Separator');
var database = require('../utils/database');
var Swipeout = require('react-native-swipeout');

var {
	View,
	Text,
	ListView,
	StyleSheet,
  TouchableHighlight,
  LayoutAnimation
} = React;

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
    textAlign: 'right',
    color: 'gray'
  },
  rowColor: {
    textAlign: 'left',
    paddingLeft: 10,
  },
  rowText: {
    fontSize: 18,
    flex: 1,
    textAlign: 'left',
    paddingLeft: 15,
  },
});

class Categories extends React.Component{

	constructor(props){
		super(props)
		this.ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2})
	  this.state = {
      categories: this.props.categories,
      dataSource: this.ds.cloneWithRows([]),
    }
	}

  componentDidMount(){
    this.setState({
      dataSource: this.ds.cloneWithRows(this.state.categories),
    });
  }

  editCategory(data){
    this.props.navigator.push({
      title: 'Edit',
      component: Category,
      passProps: {
        categories: this.state.categories,
        category: data,
        ref: (component) => {this.pushedComponent = component},
      },
      rightButtonTitle: 'Update',
      onRightButtonPress: () => { 
        this.pushedComponent && this.pushedComponent.handleSubmit();
      }
    }); 
  }

  deleteCategory(id){
    database.deleteCategory(id)
      .then(res => {
        let newData = this.state.categories;
        newData.forEach((cat,i) => {
          if(cat.id === res){
            newData.splice(i,1);
          }
        });
        LayoutAnimation.easeInEaseOut();
        this.setState({
          dataSource: this.ds.cloneWithRows(newData),
          categories: newData
        });
      }) 
  }

  renderRow(rowData){
    let swipeBtns = [
      {
        text: 'Delete',
        backgroundColor: 'red',
        underlayColor: 'rgba(0, 0, 0, 0.6)',
        onPress: this.deleteCategory.bind(this,rowData.id)
      },
    ];

    return (
      <Swipeout right={swipeBtns}
        autoClose='true'
        backgroundColor= 'transparent'>
        <TouchableHighlight
          underlayColor={'#2196F3'}
          onPress={this.editCategory.bind(this,rowData)}>
          <View style={styles.rowWrapper}>
            <Icon 
              style={styles.rowColor}
              name={'lens'}
              size={25} 
              color={'#' + rowData.color} />
            <Text style={styles.rowText}>
              {rowData.name}
            </Text>
            <Icon 
              style={styles.rowIcon}
              name={'chevron-right'}
              size={25} 
              color={'#2196F3'} />
          </View>
        </TouchableHighlight>
      </Swipeout>
    );
  }

	render(){
		return(
			<View style={styles.container}>
  			<ListView
  				dataSource={this.state.dataSource}
  				renderRow={this.renderRow.bind(this)} 
          renderSeparator={(sectionID, rowID) => <Separator key={`${sectionID}-${rowID}`} /> } />
      </View>
		);
	}
};

Categories.propTypes = {
  categories: React.PropTypes.array,
};

module.exports = Categories;