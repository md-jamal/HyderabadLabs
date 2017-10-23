import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
//import { AngularFireDatabase , FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireDatabase } from 'angularfire2/database';
import { Cab } from '../../models/cabs';
import { Geolocation } from '@ionic-native/geolocation';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';


export interface GPS
{
  latitude:string;
  longitude:string;
}


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  //cabs: FirebaseListObservable<Cab[]>;
  cabs: Observable<Cab[]>;  
  gpsItem ={} as GPS;
  interval:any;
  //watchposition:any;
  startbtndisabled = false;
  endbtndisabled = true;

  constructor(private auth: AngularFireAuth,private geolocation: Geolocation,public afd:AngularFireDatabase, public navCtrl: NavController) 
  {
  }

  getKey()
  {
    var key;
    var user = this.auth.auth.currentUser;
    var cabref = this.afd.app.database().ref('/cabs').orderByChild('number').equalTo(user.email.split("@",1)[0]);
    
    cabref.on("value", function(snapshot)
    {
      key =  Object.keys(snapshot.val())[0].toString();
      console.log("getKey:"+Object.keys(snapshot.val())[0].toString());
    });
    return key;
  }

  addLocation(location)
  {

    console.log("addLocation:"+this.getKey());
    //this.afd.list('/cabs/'+this.getKey()).push({"geolocation":location});
    //this.afd.list('/cabs/'+"-KtIEwj_SYqJA-Jit1Hc").set("geolocation", location);
    this.afd.list('/cabs/'+this.getKey()).set("geolocation", location);
  }

  startTrip()
  {
    this.startbtndisabled = true;
    this.endbtndisabled = false;
    console.log("Start trip");
    alert("Trip Started.");
    /*this.watchposition = this.geolocation.watchPosition().subscribe((position)=>{
      console.log("Latitude"+ position.coords.latitude);
      console.log("Longitude"+ position.coords.longitude);
      this.gpsItem.latitude = position.coords.latitude.toString();
      this.gpsItem.longitude = position.coords.longitude.toString();
      this.addLocation(this.gpsItem);
    });*/
    
    this.interval = setInterval(()=>{
      
      this.geolocation.getCurrentPosition().then((position) => {
        console.log("Latitude"+ position.coords.latitude);
        console.log("Longitude"+ position.coords.longitude);
        this.gpsItem.latitude = position.coords.latitude.toString();
        this.gpsItem.longitude = position.coords.longitude.toString();        
        });
        this.addLocation(this.gpsItem);
    }, 5000);


  }

  endTrip()
  {
    console.log("endTrip");
    clearInterval(this.interval);
    alert("Trip End Successfully.");
    this.startbtndisabled = false;
    this.endbtndisabled = true;
    //this.watchposition.unsubscribe();
  }


  signOut() 
  {
    console.log("signout");
    clearInterval(this.interval);
    //this.watchposition.unsubscribe();
    this.auth.auth.signOut();
    alert("You have signout Successfully.");
  }

}
