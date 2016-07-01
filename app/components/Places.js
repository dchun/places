var React = require('react-native');
var Separator = require('./helpers/Separator');
var database = require('../utils/database');
var Icon = require('react-native-vector-icons/MaterialIcons');

var {
	View,
	Text,
	StyleSheet,
  TextInput,
  ListView,
} = React;

var styles = StyleSheet.create({
	container: {
    flex: 1,
    flexDirection: 'column',
	},
  rowWrapper: {
    padding: 8,
  },
  rowIcon: {
    textAlign: 'right',
    color: 'gray'
  },
  rowDetailContainer: {
    flexDirection: 'row',
  },
  rowDetail: {
    fontSize: 14,
    textAlign: 'left',
  },
  rowIcon: {
    textAlign: 'left',
    color: 'gray'
  }
});

class Places extends React.Component{

  constructor(props){
    super(props)
    this.ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2})
    this.state = {
      dataSource: this.ds.cloneWithRows([]),
    }
  }

  componentDidMount(){
    database.getPlaces()
     .then(res => {
        console.log(res)
        this.setState({
          dataSource: this.ds.cloneWithRows(res),
        });
      });
  }

  renderRow(rowData){
    return (
      <View style={styles.rowWrapper}>
        <View style={styles.rowDetailContainer}>
          <Icon style={styles.iconField} name={'text-format'} size={15} />
          <Text style={styles.rowDetail}> {rowData.name} </Text>
        </View>
        <View style={styles.rowDetailContainer}>
          <Icon style={styles.rowIcon} name={'home'} size={15} />
          <Text style={styles.rowDetail}> {rowData.address} </Text>
        </View>
        <View style={styles.rowDetailContainer}>
          <Icon style={styles.rowIcon} name={'phone'} size={15} />
          <Text style={styles.rowDetail}> {rowData.phone} </Text>
        </View>
        <View style={styles.rowDetailContainer}>
          <Icon style={styles.rowIcon} name={'sort'} size={15} />
          <Text style={styles.rowDetail}> {rowData.category_name} </Text>
        </View>  
        <View style={styles.rowDetailContainer}>
          <Icon style={styles.rowIcon} name={'label'} size={15} />
          <Text style={styles.rowDetail}> {rowData.tags} </Text>
        </View>
        <View style={styles.rowDetailContainer}>
          <Icon style={styles.rowIcon} name={'note-add'} size={15} />
          <Text style={styles.rowDetail}> {rowData.note} </Text>
        </View>
      </View>
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

module.exports = Places;