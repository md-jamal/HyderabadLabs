import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { AngularFireDatabase , FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database-deprecated';
//import { AngularFireDatabase } from 'angularfire2/database';
import { Cab } from '../../models/cabs';
import { Geolocation } from '@ionic-native/geolocation';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs';


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

  cabs: FirebaseListObservable<Cab[]>;
  //cabs: Observable<Cab[]>;  
  gpsItem ={} as GPS;
  interval:any;
  interval2:any;
  //watchposition:any;
  startbtndisabled = false;
  endbtndisabled = true;
  onPauseSubscription: Subscription;
  isTripStated = false;

  constructor(private auth: AngularFireAuth,private geolocation: Geolocation,public afd:AngularFireDatabase, public navCtrl: NavController, public platform: Platform) 
  {
    this.onPauseSubscription = platform.pause.subscribe(() => {
      // do something meaningful when the app is put in the background
      if(this.isTripStated)
      {
        this.interval2 = setInterval(()=>{
          
          this.geolocation.getCurrentPosition().then((position) => {
            console.log("Latitude"+ position.coords.latitude);
            console.log("Longitude"+ position.coords.longitude);
            this.gpsItem.latitude = position.coords.latitude.toString();
            this.gpsItem.longitude = position.coords.longitude.toString();        
            });
            this.addLocation(this.gpsItem);
        }, 5000);
      }
      
    });
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
    this.isTripStated = true;
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
    this.isTripStated = false;
    clearInterval(this.interval);
    clearInterval(this.interval2);
    //this.platform.pause.unsubscribe();
    this.onPauseSubscription.unsubscribe();
    alert("Trip End Successfully.");
    this.startbtndisabled = false;
    this.endbtndisabled = true;
    //this.watchposition.unsubscribe();
  }


  signOut() 
  {
    console.log("signout");
    this.isTripStated = false;
    clearInterval(this.interval);
    clearInterval(this.interval2);
    //this.platform.pause.unsubscribe();
    this.onPauseSubscription.unsubscribe();
    //this.watchposition.unsubscribe();
    this.auth.auth.signOut();
    alert("You have signout Successfully.");
  }
  

}
