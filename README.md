# redux-facet-alerts

A plug-in alert system for [`redux-facet`](https://github.com/Bandwidth/redux-facet) which powers an application-wide targeted alert system with minimal code.

After you've integrated `redux-facet`, you can enhance your containers, reducers and sagas to enable them to display, create, and dismiss alerts in a structured fashion.

[Check out a simple example here](http://dev.bandwidth.com/redux-facet-alerts/). The source is located in [/example](https://github.com/Bandwidth/redux-facet-alerts/tree/master/example).

## Immutable.js Support

To use `redux-facet-alerts` with `immutable`, import all modules from `@bandwidth/redux-facet-alert/immutable`. Module names and usages stay the same.

## Documentation

### Default export: `withAlerts()`

A higher-order-component which enhances a `facet` container with:

1. Access to alerts targeted toward that facet for rendering
2. A set of action creator properties which can create and dismiss alerts

#### Using `withAlerts()`

Compose `withAlerts()` after `facet()` before passing in your component:

```javascript
facet('users', mapDispatchToProps)(
  withAlerts()(
    ViewComponent
  ),
);
```

To make things more idiomatic, it's recommented to use the `compose` export from `redux-facet`:

```javascript
compose(
  facet('users', mapDispatchToProps),
  withAlerts(),
)(ViewComponent);
```

Remember, `withAlerts()` must come *after* `facet()`.

#### Properties provided

A component enhanced using `withAlerts()` will receive the following props:

* `alerts`
  * Array of shape: `{ id: String, message: String, timestamp: Number, attributes: Object }`
  * Pre-sorted, with newest alerts last
  * `id` is globally unique and ordered by creation time
  * `timestamp` is milliseconds since epoch (`Date::getTime` of creation time)
  * `attributes` is a freeform map of any additional details you want to provide
* `createAlert(message: String, attributes?: Object)`
  * Action creator function which is already bound to this facet.
  * Call it to create an alert.
* `dismissAlert(id: String)`
  * Action creator function which is already bound to this facet.
  * Call it with an alert's id to dismiss it.
* `dismissAllAlerts()`
  * Action creator function which is already bound to this facet.
  * Call it to dismiss all alerts for this facet.

### `alertReducer`

Include this reducer within your facet reducers to keep track of alerts for the facet. Without this reducer, the library will not work.

This reducer expects to be mounted within a facet reducer. If this is done correctly, it will therefore only listen to alert actions related to its facet. It keeps track of which alerts should be visible in the facet.

#### Basic usage

To mount it manually, please reference the `.key` property to mount it at the correct location in your facet reducer, or the library will not work.

```javascript
const facetReducer = facetReducer('users', combineReducers({
  foo: fooReducer,
  bar: barReducer,
  [alertViewReducer.key]: alertViewReducer,
}));
```

#### Automatic usage

> Note: `mount` will not work with `combineReducers`, since `combineReducers` ignores any 'extra' keys that get added to the resulting map.

You can mount the `alertViewReducer` automatically into your facet reducer using its `.mount(facetReducer: Function)` function. By calling it with your facet reducer, it will return a new reducer and mount itself at the correct key. Your base reducer must return a state which is an object so that a key can be created for the alert reducer.

```javascript
const enhancedFacetReducer = alertViewReducer.mount(facetReducer);
```

### `alertActions`

The library exports a set of action creators which you can use to manage alerts within sagas or other parts of your code.

The action creators are:

* `alertActions.create(message: String, attributes: Object)`: creates an alert with the specified message and a set of optional freeform attributes. Attributes do not affect any library behavior, but they will be present on your alerts when you render them. A common use of attributes might be to attach a `priority` or `type` value to your alerts so that they can be rendered differently.
* `alertActions.dismiss(id: String)`: dismisses the alert specified by the id.
* `alertActions.dismissAll()`: dismisses all alerts in the facet.

#### NOTE: facet name metadata is required

`redux-facet-alerts` does not apply facet names to actions created by its action creators. It's up to you to apply them if necessary. If you use the action creators provided to your component by `withAlerts`, these will be applied automatically. Likewise, if you use these action creators in a saga which is created with `facetSaga`, the facet name will be applied.

You may purposefully omit the facet name metadata on the `dismissAll` action creator to dismiss every alert in your application. However, none of the other action creators will currently do anything useful if no facet name is provided.

To apply a facet name to an action, use `redux-facet`'s `withFacet` helper function.

### `alertSelectors`

`redux-facet-alerts` ships with a few selector creators which can be used to read alert data from the store.

* `alertSelectors.createAlertsSelector(facetName: String): alertsSelector(state)`
  * A function which creates a selector. Takes one parameter, `facetName`.
  * The created selector returns a collection of alerts, where the key is the alert id, and the value is the alert.
* `alertSelectors.createAlertsListSelector(facetName: String): alertsListSelector(state)`
  * A function which creates a selector. Takes one parameter, `facetName`.
  * The created selector computes an array of alert objects which a facet is currently displaying. They are inherently sorted from oldest to newest.
* `alertSelectors.createAlertSelectorCreator(alertId: String): alertSelectorCreator(facetName: String): alertSelector(state)`
  * A factory function which creates a facet selector creator for the alert specified by id.
  * The returned selector creator takes a facet name and returns a selector for the alert.
  * The selector will retrieve the alert from the facet's alert state.
