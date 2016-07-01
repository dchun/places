var React = require('react-native');
var Icon = require('react-native-vector-icons/MaterialIcons');

var {
  View,
  Text,
  StyleSheet,
  TouchableHighlight
} = React;

var styles = StyleSheet.create({
  checkboxWrapper: {
    padding: 10,
    flexDirection: 'row',
  },
  label: {
    flex: 1,
    textAlign: 'left',
  },
  checkbox: {
    textAlign: 'left',
    color: 'gray'
  },
});

class Checkbox extends React.Component{

  render(){
    var icon = <Icon style={styles.checkbox} name={'check-box-outline-blank'} size={25} />;

    if(this.props.checked == true){
      icon = <Icon style={[styles.checkbox, this.props.checkedStyle]} name={'check-box'} size={25} />;
    }

    var checkbox = (
      <View style={styles.checkboxWrapper}>
        {icon}
        <Text style={[styles.label, this.props.labelStyle]}>{this.props.label}</Text>
      </View>
    );

    return (
      <TouchableHighlight 
        underlayColor={'#26A69A'}
        onPress={this.props.onPress}>
        {checkbox}
      </TouchableHighlight>
    );
  }

};

Checkbox.propTypes = {
  label: React.PropTypes.string,
  checked: React.PropTypes.oneOfType([
    React.PropTypes.node,
    React.PropTypes.bool
  ]),
  checkedStyle: React.PropTypes.node,
  labelStyle: React.PropTypes.node,
  onPress: React.PropTypes.func,
};


module.exports = Checkbox;