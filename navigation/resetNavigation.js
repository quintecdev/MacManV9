export default (navigation,page='splash') =>navigation.reset({
    index: 0,
    routes: [{name: page}],
  });