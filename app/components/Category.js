var React = require('react-native');
var ColorPicker = require('./helpers/ColorPicker');
var database = require('../utils/database');

var {
	View,
	Text,
	StyleSheet,
  TextInput,
  ScrollView,
  Alert
} = React;

var styles = StyleSheet.create({
	container: {
    flex: 1,
    flexDirection: 'column',
	},
  textField: {
  	height: 40,
    padding: 10,
    margin: 5,
    fontSize: 18,
  },
});

class Category extends React.Component{

	constructor(props){
		super(props)
	  this.state = {
      categories: this.props.categories,
      category: this.props.category,
    }
	}

  componentDidMount(){
    let route = this.props.navigator.navigationContext.currentRoute;
    route.onRightButtonPress = () => {this.handleSubmit()};
    this.props.navigator.replace(route);
  }

  handleSubmit(){
    if(this.state.category.name && this.state.category.color){
      if(this.state.category.id === 0){
        database.createCategory(this.state.category.name, this.state.category.color)
          .then(results => {
            let categories = this.state.categories;
            categories.push(results);
            // as opposed to new object meant for pop from control panel
            // send saved category back to place.js as selected
            let category = this.props.category;
            category.id = results.id;          
            category.name = results.name;
            category.color = results.color;
            this.setState({
              categories: categories,
              category: category
            });
            this.props.navigator.pop();
          });
      } else {
        database.updateCategory(this.state.category)
          .then(results => {
            let categories = this.state.categories.map(row => {
              if(row.id === results.id){
                row.name = results.name;
                row.color = results.color;              
              }
              return row;
            });
            this.setState({
              categories: categories,
            });
            this.props.navigator.pop();
          });
        }
    } else {
      Alert.alert('Missing fields', 'Category name and color are required.')
    }
  }
  
  chosenColor(color){
    let category = {
      id: this.state.category.id,
      name: this.state.category.name,
      color: color
    };
    this.setState({category: category});
  }

	render(){
		return(
			<ScrollView style={styles.container}>
        <TextInput
        	blurOnSubmit={true}
          selectTextOnFocus={true}
          onChange={(e) => {
            let category = {
              id: this.state.category.id,
              name: e.nativeEvent.text,
              color: this.state.category.color
            };
            this.setState({category:category})
          }}
          style={styles.textField}
          placeholder={'category name'}
          value={this.state.category.name} />
        <ColorPicker value={this.state.category.color} color={this.chosenColor.bind(this)}/>
      </ScrollView>
		);
	}
};

Category.propTypes = {
  categories: React.PropTypes.array,
};

module.exports = Category;