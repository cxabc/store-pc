import React from 'react';
import '../../assets/css/user/profile.scss'
import Utils from '../../common/Utils'
import {ProductList} from "./Products";
import App from "../../common/App";

export default class ProductTemp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            _ids: this.props.match.params.ids,
            ids: [],
            products: [],
        };
    }

    componentDidMount() {
        Utils.addr.loadRegion(this);
        this.loadData();
    }

    loadData = () => {


        let {_ids, ids} = this.state;

        ids = decodeURIComponent(decodeURIComponent(_ids));
        ids = JSON.parse(ids);
        this.setState({ids});
        App.api(`/adm/product/products_user`, {productQo: JSON.stringify({codes: ids})}).then((products) => {
            let {content} = products;
            this.setState({products: content});
        });
    };

    render() {

        let {products} = this.state;

        return <div className="profile-page">

            <ProductList list={products}/>

            <div className='clearfix'/>

            <div className='clearfix-h20'/>
        </div>
    }
}