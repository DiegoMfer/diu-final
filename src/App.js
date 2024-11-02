import LoginFormComponent from "./Components/User/LoginFormComponent";
import CreateUserComponent from "./Components/User/CreateUserComponent";
import ListProductsComponent from "./Components/Products/ListProductsComponent";
import EditProductComponent from "./Components/Products/EditProductComponent";
import DetailsProductComponent from "./Components/Products/DetailsProductComponent";
import CreateProductComponent from "./Components/Products/CreateProductComponent";
import ListMyProductsComponent from "./Components/Products/ListMyProductsComponent";
import {Route, Routes, Link, useNavigate, useLocation } from "react-router-dom"
import {Layout, Menu, Avatar, Typography, Col, Row, notification } from 'antd';
import {FireOutlined, LoginOutlined} from '@ant-design/icons';
import {useEffect, useState} from "react";
import WelcomePageComponent from "./Components/Basic/WelcomePageComponent";

let App = () => {
    const [api, contextHolder] = notification.useNotification();

    let navigate = useNavigate();
    let location = useLocation();
    let [login, setLogin] = useState(false);

    // for not using Layout.Header, Layout.Footer, etc...
    let {Header, Content, Footer} = Layout;

    useEffect(() => {
        checkAll()
    }, [])

    let checkAll = async () => {
        let isActive = await checkLoginIsActive()
        checkUserAccess(isActive)
    }

    const openNotification = (placement, text, type) => {
        api[type]({
            message: 'Notification',
            description: text,
            placement,
        });
    };
 
    let checkLoginIsActive = async () => {
        if (localStorage.getItem("apiKey") == null) {
            setLogin(false);
            return;
        }

        let response = await fetch(
            process.env.REACT_APP_BACKEND_BASE_URL + "/users/isActiveApiKey",
            {
                method: "GET",
                headers: {
                    "apikey": localStorage.getItem("apiKey")
                }
            });

        if (response.ok) {
            let jsonData = await response.json();
            setLogin(jsonData.activeApiKey)

            if (!jsonData.activeApiKey){
                navigate("/login")
            }
            return(jsonData.activeApiKey)
        } else {
            setLogin(false)
            navigate("/login")
            return (false)
        }
    }

    let checkUserAccess= async (isActive) => {
        let href = location.pathname
        if (!isActive && !["/","/login","/register"].includes(href) ){
            navigate("/login")
        }
    }

    let disconnect = async () => {
        let response = await fetch(
            process.env.REACT_APP_BACKEND_BASE_URL + "/users/disconnect",
            {
                method: "GET",
                headers: {
                    "apikey": localStorage.getItem("apiKey")
                }
            });

        localStorage.removeItem("apiKey");
        setLogin(false)
        navigate("/login")
    }


    const {Text} = Typography;
    return (
        <Layout className="layout" style={{minHeight: "100vh"}}>
            {contextHolder}
            <Header>
                <Row>
                    <Col xs= {18} sm={19} md={20} lg={21} xl = {22}>
                        {!login &&
                            <Menu theme="dark" mode="horizontal" items={[
                                {key: "logo", label: <img src="/logo.png" width="40" height="40"/>},
                                {key: "menuLogin", icon: <LoginOutlined/>, label: <Link to="/login">Login</Link>},
                                {key: "menuRegister", label: <Link to="/register">Register</Link>},
                            ]}>
                            </Menu>
                        }

                        {login &&
                            <Menu theme="dark" mode="horizontal" items={[
                                {key: "logo", label: <img src="/logo.png" width="40" height="40"/>},
                                {key: "menuProducts", label: <Link to="/products">Products</Link>},
                                {key: "menuMyProduct", label: <Link to="/products/own">My Products</Link> },
                                {key: "menuCreateProduct", label: <Link to="/products/create">Sell</Link> },
                                {key: "menuDisconnect", label: <Link to="#" onClick={disconnect}>Disconnect</Link>},
                            ]}>
                            </Menu>
                        }
                    </Col>
                    <Col xs= {6} sm={5} md = {4}  lg = {3} xl = {2}
                         style={{display: 'flex', flexDirection: 'row-reverse' }} >
                        { login ? (
                            <Avatar size="large"
                                    style={{ backgroundColor: "#ff0000", verticalAlign: 'middle', marginTop: 12  }}>
                                { localStorage.getItem("email").charAt(0) }
                            </Avatar>
                        ) : (
                            <Link to="/login"> <Text style={{ color:"#ffffff" }}>Login</Text></Link>
                        )}
                    </Col>
                </Row>
            </Header>
            <Content style={{padding: "20px 50px"}}>
                <div className="site-layout-content">
                    <Routes>
                        <Route path="/" element={
                            <WelcomePageComponent/>
                        }/>
                        <Route path="/register" element={
                            <CreateUserComponent openNotification={openNotification}/>
                        }/>
                        <Route path="/login"  element={
                            <LoginFormComponent setLogin={setLogin} openNotification={openNotification}/>
                        }/>
                        <Route path="/products" element={
                            <ListProductsComponent/>
                        }/>
                        <Route path="/products/edit/:id" element={
                            <EditProductComponent/>
                        }/>
                        <Route path="/products/:id" element={
                            <DetailsProductComponent/>
                        }/>
                        <Route path="/products/create" element={
                            <CreateProductComponent />
                        }></Route>
                        <Route path="/products/own" element={
                            <ListMyProductsComponent />
                        }></Route>
                    </Routes>
                </div>
            </Content>

            <Footer style={{textAlign: "center"}}> Wallapep </Footer>
        </Layout>
)
}

export default App;