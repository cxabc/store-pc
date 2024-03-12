import React from 'react';
import {HashRouter, Route, Switch} from 'react-router-dom'
import HomeWrap from './component/common/HomeWrap';
import Home from './component/common/Home';
import Products from "./component/product/Products";
import SignUp from "./component/SISU/SignUp";
import SignIn from "./component/SISU/SignIn";
import ForgetPassword from "./component/SISU/ForgetPassword";
import ResetPassword from "./component/SISU/ResetPassword";
import User from "./component/user/User";
import UserWrap from "./component/common/UserWrap";
import Product from "./component/product/Product";
import Address from "./component/address/Address";
import Order from "./component/order/Order";
import Car from "./component/car/Car";
import OrderTemp from "./component/order/OrderTemp";
import Coupon from "./component/coupon/Coupon";
import UserCoupon from "./component/coupon/UserCoupon";
import ProductTemp from "./component/product/ProductTemp";
import Comment from "./component/comment/Comment"

const routes = (
    <HashRouter>
        <Switch>
            <Route path='/user' children={() => (
                <UserWrap>
                    <Route path='/user/profile' component={User}/>
                    <Route path='/user/address' component={Address}/>
                    <Route path='/user/order' component={Order}/>
                    <Route path='/user/usercoupon' component={UserCoupon}/>
                    <Route path='/user/comment/:id' component={Comment}/>
                </UserWrap>
            )}>
            </Route>
            <Route path='/' children={() => (

                <HomeWrap>
                    <Switch>
                        <Route path='/' exact component={Home}/>
                        <Route path='/signin' component={SignIn}/>
                        <Route path='/findpassword' component={ForgetPassword}/>
                        <Route path='/resetpassword' component={ResetPassword}/>
                        <Route path='/signup' component={SignUp}/>
                        <Route path='/products/:firstSortId' component={Products}/>
                        <Route path='/product/:id' component={Product}/>
                        <Route path='/car' component={Car}/>
                        <Route path='/ordertemp/:ids' component={OrderTemp}/>
                        <Route path='/producttemp/:ids' component={ProductTemp}/>

                        <Route path='/coupon' component={Coupon}/>
                    </Switch>
                </HomeWrap>
            )}>
            </Route>
        </Switch>
    </HashRouter>
);

export default routes;