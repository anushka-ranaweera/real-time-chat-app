export interface ClaimPaginationRequest {
  Page: number;
  PageSize: number;
  OrderBy: number;
  ClaimFilterType: number;
}

export interface ClaimPaginationInbox {
  claimId: number;
  miscellaneousRecordId: number;
  claimNumber: string;
  insurer: string;
  contactName: string;
  vehicleInfo: string;
  contactDetail: string;
  claimRecordType: string;
  recordDate: Date;
  hasError: boolean;
}

export interface ClaimPaginationList {
  items: ClaimPaginationInbox[];
}

export interface ClaimPaginationResponse {
  CurrentPage: number;
  PageSize: number;
  TotalPages: number;
  TotalItems: number;
  TotalClaimItems: number;
  TotalMiscItems: number;
  ClaimsInbox: ClaimPaginationInbox[];
}

export interface JwtTokenResult {
  token: string;
  userId: number;
  expiration: Date;
  refreshToken: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface LoginUser {
  email: string;
  password: string;
  rememberMe: boolean;
  refreshToken: string;
  authType: number;
}
