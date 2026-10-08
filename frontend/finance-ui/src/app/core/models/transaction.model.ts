export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransactionDto {
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionsListResponse {
  transactions: Transaction[];
  pagination: PaginationMeta;
}

export interface CategoriesResponse {
  INCOME: string[];
  EXPENSE: string[];
}
