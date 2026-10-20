
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Product {
  id?: number;
  name: string;
  price: number;
  description: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private apiUrl = '/api/products';

  products: Product[] = [];
  searchTerm = '';
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';
  editingId: number | null = null;

  form: Product = {
    name: '',
    price: 0,
    description: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  get filteredProducts(): Product[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.products;
    }

    return this.products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      (product.description ?? '').toLowerCase().includes(term)
    );
  }

  get totalValue(): number {
    return this.products.reduce(
      (total, product) => total + Number(product.price || 0),
      0
    );
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<Product[]>(this.apiUrl).subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement produits :', err);

        this.errorMessage =
          `Erreur chargement : HTTP ${err.status} — ${err.message}`;

        this.loading = false;
      }
    });
  }

  saveProduct(): void {
    if (
      !this.form.name.trim() ||
      this.form.price == null ||
      !Number.isFinite(Number(this.form.price)) ||
      Number(this.form.price) < 0
    ) {
      this.errorMessage = 'Veuillez saisir un nom et un prix valide.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const product: Product = {
      name: this.form.name.trim(),
      price: Number(this.form.price),
      description: (this.form.description ?? '').trim()
    };

    const request = this.editingId !== null
      ? this.http.put<Product>(
          `${this.apiUrl}/${this.editingId}`,
          product
        )
      : this.http.post<Product>(this.apiUrl, product);

    request.subscribe({
      next: () => {
        this.successMessage = this.editingId !== null
          ? 'Produit modifié avec succès !'
          : 'Produit ajouté avec succès !';

        this.resetForm();
        this.saving = false;
        this.loadProducts();
      },
      error: (err) => {
        console.error('Erreur API saveProduct :', err);

        this.errorMessage =
          `Échec de l’enregistrement (HTTP ${err.status}) : ${err.message}`;

        this.saving = false;
      }
    });
  }

  editProduct(product: Product): void {
    if (product.id === undefined) {
      return;
    }

    this.editingId = product.id;

    this.form = {
      name: product.name,
      price: product.price,
      description: product.description ?? ''
    };

    this.successMessage = '';
    this.errorMessage = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteProduct(product: Product): void {
    if (product.id === undefined) {
      return;
    }

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer « ${product.name} » ?`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.http.delete(`${this.apiUrl}/${product.id}`).subscribe({
      next: () => {
        this.products = this.products.filter(
          p => p.id !== product.id
        );

        this.successMessage = 'Produit supprimé avec succès !';

        if (this.editingId === product.id) {
          this.resetForm();
        }
      },
      error: (err) => {
        console.error('Erreur suppression produit :', err);
        this.errorMessage =
          `Impossible de supprimer le produit (HTTP ${err.status}).`;
      }
    });
  }

  resetForm(): void {
    this.editingId = null;

    this.form = {
      name: '',
      price: 0,
      description: ''
    };
  }
}
