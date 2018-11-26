This app makes heavy use of a modified version of the MapView.js api

The is an example of using local storage to save locations for those that care about speed during retreival of places and to save private places.

Also, prior to google maps coming up with the "labels" feature there was no way to mark a saved place with personal details. And currently if saving lots of places, there is not way to make sense of the sead of yellow stars.

So I made this app to help me organize my places. Along with adding notes.

People have recommended that I create a sharing function to this app. Although it would make it more popular, it would make it less private. And since the orignal designs had privacy in mind, it would take an architectural overhaul to include those features. If you would like to contribute designs to make it happen while also maintaining a healthy level of privacy, please do so.

![Screenshot](images/5-5inAerial.png =250x)
![Screenshot](images/5-5inColorPicker.png =250x)
![Screenshot](images/5-5inFilter.png =250x)
![Screenshot](images/5-5inPlace.png =250x)
![Screenshot](images/5-5inSearch.png =250x)

### Modified external libraries:

node_modules/react-native/React/Views/RCTConvert+MapKit.m
	+ line 53: select annotation mapping assignment for auto pin selection

node_modules/react-native/React/Views/RCTMapAnnotation.h
	+ line 19: select annotation attribute definition

node_modules/react-native/React/Views/RCTMapManager.m
	+ line 341: tie into annotation view callback and add select annotation mapping

node_modules/react-native-sqlite-storage/src/ios/SQLite.m
	+ line 70: function for distance query in sqlite
	+ line 207: call to distance function in export module

node_modules/react-native/React/Views/RCTMapManager.m
	+ line 211: https://github.com/facebook/react-native/commit/446d7b7c17c46b7d6ad46f4bc01b6b03e4325bd6#diff-87619ee4eb114d229bfba7eb3107595f
	+ lines 259, 271, 284: https://github.com/facebook/react-native/commit/546d140ec7a280821650ed736baab7c8c32aee63#diff-87619ee4eb114d229bfba7eb3107595f
	+ line 215, 218: uncomment to allow reuse of identifier
	
### Dilemmas in design:

NavigatorIOS doesn't have an intuititve way to passProps back to original scene. Also, cannot pass function on navigator button press for the scene that is rendered. Attempted to switch to Navigator since scenes can be accessed to pass props to desired scenes but since the scene transitions were laggy. Esepcially for mapviews on the next scene. Tried to use transactions in db for preliminary inserts to rollback in case save was not committed but the sqlite adaptor is not well documented for suce transactions.