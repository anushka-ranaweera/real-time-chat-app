import { Injectable, signal } from '@angular/core';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { ClaimPaginationInbox, ClaimPaginationResponse } from '../model/data';

@Injectable({
  providedIn: 'root',
})
export class RealtimeClientService {
  private hubConnection?: signalR.HubConnection;
  public connectionId: any;
  private pendingClaimUpdatedSubject = new Subject<ClaimPaginationInbox[]>();
  claimsUpdated$: Observable<ClaimPaginationInbox[]> =
    this.pendingClaimUpdatedSubject.asObservable();
  allPendingClaims: ClaimPaginationInbox[] = [];

  constructor() {}

  connect() {
    let accessToken = sessionStorage.getItem('token');
    console.log(accessToken);
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:7273/claimbroadcasthub', {
        withCredentials: accessToken != null,
        accessTokenFactory: () => accessToken ?? '',
      }) //REPLACE YOUR HUB URL
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connection started.'))
      .then(() => this.getConnectionId())
      .catch((err) =>
        console.log('Error while starting SignalR connection: ', err)
      );

    const reconnect = async () => {
      // Delay before attempting to reconnect (0 to 5 seconds)
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 5000));

      try {
        // Attempt to restart the connection
        await this.hubConnection?.start();
        console.log('SignalR reconnected successfully.');
      } catch (error) {
        console.error('Error reconnecting to SignalR:', error);
        // Retry reconnecting
        await reconnect();
      }
    };

    // Listen for the close event and initiate reconnection
    this.hubConnection.onclose(async () => {
      console.log('SignalR connection closed. Attempting to reconnect...');
      await reconnect();
    });

    this.hubConnection.on(
      'PendingClaimsUpdated',
      (claim: ClaimPaginationInbox) => {
        console.log('Claim Reteived...');
        this.allPendingClaims.push(claim);

        // Sorting the array of objects by date
        this.allPendingClaims.sort((a, b) => {
          // Convert the dates to milliseconds since epoch
          const dateA = new Date(a.recordDate).getTime();
          const dateB = new Date(b.recordDate).getTime();

          // Compare the dates in reverse order for descending sorting
          return dateB - dateA;
        });

        console.log([...this.allPendingClaims]); // Using spread operator
        // Get the current value of the subject
        this.pendingClaimUpdatedSubject.next([...this.allPendingClaims]);
      }
    );
  }

  // Method to get all pending claims
  getAllPendingClaims(): ClaimPaginationInbox[] {
    return this.allPendingClaims;
  }

  // Method to get the observable for subscribing to updates
  getPendingClaimUpdates(): Observable<ClaimPaginationInbox[]> {
    return this.pendingClaimUpdatedSubject.asObservable();
  }

  private getConnectionId = () => {
    this.hubConnection?.invoke('getconnectionid').then((data) => {
      console.log(data);
      this.connectionId = data;
    });
  };

  public claimRequest(): void {
    this.hubConnection
      ?.invoke('ClaimRequest')
      .catch((err) => console.error('Error while sending message: ', err));

    console.log(this.hubConnection?.state);
  }

  private showBrowserNotification(notification: string) {
    if (Notification.permission === 'granted') {
      new Notification('New Notification', { body: notification });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('New Notification', { body: notification });
        }
      });
    }
  }
}
