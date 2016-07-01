var React = require('react-native');

var {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableHighlight,
  ListView,
  Dimensions
} = React;

var styles = StyleSheet.create({
	colorRows: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	colorSwatch: {
		flex: 1,
		borderColor: 'white',
	}
});

var colors = [
	 'E57373','F44336','D32F2F','B71C1C',
	 'BA68C8','9C27B0','7B1FA2','4A148C',
	 '7986CB','3F51B5','303F9F','1A237E',
	 '4FC3F7','03A9F4','0288D1','01579B',
	 '4DB6AC','009688','00796B','004D40',
	 'AED581','8BC34A','689F38','33691E',
	 'FFF176','FFEB3B','FBC02D','F57F17',
	 'A1887F','795548','5D4037','3E2723',
];

class ColorPicker extends React.Component{

	constructor(props){
		super(props)
		this.state = {
			boxSize: undefined,
			color: this.props.value,
			ref: null
		}
	}

	componentDidMount(){
		var { width, height } = Dimensions.get('window');
		var boxSize = (width/4);
		this.setState({boxSize:boxSize});
	}

	handleColorPress(color,i){
		let lastRef = this.state.ref
		this.setState({
			ref: i,
			color: color
		});
		if(lastRef !== null){
			this.refs[lastRef].refs.childRef.setNativeProps({style: {borderWidth: 0} });
		}
		this.refs[i].refs.childRef.setNativeProps({style: {borderWidth: 2} });
		this.props.color(color);
  }

  renderColorSwatches(){
  	return(
			colors.map((color, i) => {
				return(
					<TouchableHighlight
						key={i}
						ref={i}
						onPress={this.handleColorPress.bind(this,color,i)} >
						<View 
							style={[styles.colorSwatch,{
								backgroundColor: '#' + color,
								width: this.state.boxSize, 
								height: this.state.boxSize,
								borderWidth: this.props.value === color ? 2 : 0
							}]} />
					</TouchableHighlight>
				);
			})
		);
  }

	render(){
		return(
			<View
				onLayout={(e) => {
					let newBoxSize = (e.nativeEvent.layout.width/4);
					this.setState({boxSize:newBoxSize});
				}}>
				<ScrollView
					keyboardDismissMode={'on-drag'}
					contentContainerStyle={styles.colorRows}
					automaticallyAdjustContentInsets={false}>
					{ this.renderColorSwatches() }
				</ScrollView>	
			</View>
		);
	}


};

module.exports = ColorPicker