import { Component, OnInit, signal, OnDestroy, Input } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RealtimeClientService } from '../../services/realtime-client.service';
import {
  ClaimPaginationInbox,
  ClaimPaginationRequest,
  JwtTokenResult,
  LoginUser,
} from '../../model/data';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { firstValueFrom, Subscription, Observable, map } from 'rxjs';
import { AuthenticationInterceptor } from '../../interceptors/authinterceptor';

@Component({
  selector: 'app-claim-pagination',
  standalone: true,
  imports: [DatePipe, FormsModule, HttpClientModule],
  templateUrl: './claim-pagination.component.html',
  styleUrl: './claim-pagination.component.scss',
  providers: [AuthenticationInterceptor],
})
export class ClaimPaginationComponent implements OnInit, OnDestroy {
  claimSubscription?: Subscription;
  claims = signal<ClaimPaginationInbox[]>([]);
  claimRequest: ClaimPaginationRequest = {
    Page: 1,
    PageSize: 200,
    ClaimFilterType: 1,
    OrderBy: 2,
  };
  claimResponse: any;
  needsLogin = true;
  login?: string;
  password?: string;
  loginUser: LoginUser = {
    email: '',
    password: '',
    authType: 1,
    refreshToken: '',
    rememberMe: true,
  };

  constructor(
    private realtime: RealtimeClientService,
    private http: HttpClient
  ) {}

  ngOnDestroy(): void {
    this.claimSubscription?.unsubscribe();
  }

  async ngOnInit() {}

  async loadClaims() {
    this.realtime.connect();

    this.claimResponse = await firstValueFrom(
      this.http
        .post('https://localhost:7273/api/v1/claim/paginate', this.claimRequest)
        .pipe(
          map((response: any) => {
            // Map the response to your model class
            return {
              // Map other properties as needed
              PageSize: response.data.pageSize,
              CurrentPage: response.data.currentPage,
              TotalClaimItems: response.data.totalClaimItems,
              TotalItems: response.data.totalItems,
              TotalMiscItems: response.data.totalMiscItems,
              TotalPages: response.data.totalPages,
              ClaimsInbox: response.data.claimsInbox,
            };
          })
        )
    );
    //console.log(this.claimResponse);
    console.log(this.claimResponse.TotalItems);
    this.claims.set([...this.claimResponse.ClaimsInbox]);
    this.claimResponse.ClaimsInbox.forEach((claim: ClaimPaginationInbox) => {
      this.realtime.allPendingClaims.push(claim);
    });

    console.log(this.realtime.allPendingClaims);

    this.claimSubscription = this.realtime.claimsUpdated$.subscribe((claim) =>
      this.claims.set([...claim])
    );
  }

  async requestClaim() {
    console.log('Claim Request...');
    await this.realtime.claimRequest();
  }

  async Login(login: LoginUser) {
    if (login.email && login.password) {
      try {
        console.log(login.email);
        console.log(login.password);
        console.log(login);
        login.authType = 1;

        let response = await firstValueFrom(
          this.http
            .post('https://localhost:7273/api/v1/auth/login', login)
            .pipe(
              map((response: any) => {
                // Map the response to your model class
                return {
                  // Map other properties as needed
                  Token: response.data.token,
                };
              })
            )
        );
        // debugger;
        sessionStorage.setItem('token', response.Token);
        this.needsLogin = false;
        await this.loadClaims();
        //this.realtime.connect();
      } catch (e) {
        alert('Incorrect username/password');
      }
    }
  }
}
