import React from 'react'
import {Avatar, Badge, Carousel, Icon} from 'antd'
import {App, CTYPE} from "../../common";
import UserProfile from '../user/UserProfile'
import {inject, observer} from 'mobx-react'
import NavLink from '../../common/NavLink.jsx';
import '../../assets/css/comps/comps.scss'

const menus = [
    {cn: '首页', en: 'HOME', path: '/'},
    {cn: '手机', en: 'PHONE', path: '/products/53'},
    {cn: '电脑', en: 'COMPUTER', path: '/products/56'},
    {cn: '领券中心', en: 'COUPON', path: '/coupon'},
];

@inject("carts")
@observer
class Header extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            profile: {}
        };
    }

    componentDidMount() {
        UserProfile.get().then((profile) => {
            this.setState({profile});
        })
    }

    render() {
        let {profile = {}} = this.state;
        let {user = {}} = profile;
        let count = this.props.carts.getCount || 0;

        return <div className="top-header">
            <div className="inner">

                <a href='/'>
                    <div className="logo"/>
                </a>

                {!user.id && <div className='btn' onClick={() => App.go('/signin')}>登录</div>}
                {user.id && <div className='btn' onClick={() => App.go('/user/profile')}>
                    <Avatar size={50} src={user.img}/>
                </div>}
                <div className='shopping' onClick={() => {
                    App.go(`/car`)
                }}>
                    <Icon type="shopping-cart" className="shopping-cart"/>
                    {count > 0 && <Badge count={count} className='badge'/>}
                </div>
                <ul>
                    {menus.map((menu, index) => {
                        let {cn, en, path} = menu;
                        return <li key={index}>
                            <NavLink to={path} cn={cn} en={en}/>
                        </li>
                    })}
                </ul>
            </div>
        </div>
    }
}

class Banners extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            type: this.props.type,
            banners: this.props.banners,
        }
    }

    go = (banner) => {
        let {url} = banner;
        if (url) {
            window.location.href = url;
        }
    };

    render() {
        let {banners = [], type} = this.state;
        let isHome = type === CTYPE.bannerTypes.HOME;
        let length = banners.length;

        return <div className={isHome ? 'main-carousel home-carousel' : 'main-carousel'}>

            {length > 0 && <Carousel autoplay={length > 1} dots={length > 1}
                                     speed={1000} autoplaySpeed={isHome ? 5000 : 4000} infinite>
                {banners.map((banner, index) => {
                    let {img} = banner;
                    return <div key={index} className='item'>

                        <div className='item'
                             style={{
                                 backgroundImage: `url(${img})`,
                                 backgroundPosition: '50% 50%',
                                 backgroundRepeat: 'no-repeat'
                             }}
                             onClick={() => {
                                 this.go(banner);
                             }}/>
                    </div>
                })}
            </Carousel>}
        </div>
    }
}

class Footer extends React.Component {
    render() {
        return <div className="footer">
        </div>
    }
}

export {Banners, Header, Footer}