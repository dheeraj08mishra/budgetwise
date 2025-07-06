import Body from "./Body";
import { Provider } from "react-redux";
import appStore from "../utils/redux/appStore";
import { Toaster } from "react-hot-toast";
const App = () => {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Provider store={appStore}>
        <Body />
      </Provider>
    </>
  );
};

export default App;
