import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { DynamicComponent } from '../../base/dynamic-component';

export interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'date'
    | 'select'
    | 'textarea'
    | 'checkbox';
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: { value: string | number; label: string }[];
  defaultValue?: any;
  validationMessage?: string;
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css',
})
export class DynamicFormComponent extends DynamicComponent {
  @Output() formSubmit = new EventEmitter<any>();

  formTitle: string = '';
  formSubtitle: string = '';
  submitButtonText: string = 'Submit';
  cancelButtonText: string = 'Cancel';
  showCancelButton: boolean = false;
  fields: FormField[] = [];
  formLayout: 'vertical' | 'horizontal' = 'vertical';
  formGroup!: FormGroup;
  submitted: boolean = false;

  constructor(private fb: FormBuilder, cdr: ChangeDetectorRef) {
    super(cdr);
  }

  override initializeComponent(): void {
    this.formTitle = this.getConfigValue('title', '');
    this.formSubtitle = this.getConfigValue('subtitle', '');
    this.submitButtonText = this.getConfigValue('submitButtonText', 'Submit');
    this.cancelButtonText = this.getConfigValue('cancelButtonText', 'Cancel');
    this.showCancelButton = this.getConfigValue('showCancelButton', false);
    this.formLayout = this.getConfigValue('layout', 'vertical');
    this.fields = this.getConfigValue('fields', []);

    this.buildForm();
  }

  private buildForm(): void {
    const formControls: any = {};

    this.fields.forEach((field) => {
      const validators = [];

      if (field.required) {
        validators.push(Validators.required);
      }

      if (field.minLength !== undefined) {
        validators.push(Validators.minLength(field.minLength));
      }

      if (field.maxLength !== undefined) {
        validators.push(Validators.maxLength(field.maxLength));
      }

      if (
        field.min !== undefined &&
        (field.type === 'number' || field.type === 'date')
      ) {
        validators.push(Validators.min(field.min));
      }

      if (
        field.max !== undefined &&
        (field.type === 'number' || field.type === 'date')
      ) {
        validators.push(Validators.max(field.max));
      }

      if (field.type === 'email') {
        validators.push(Validators.email);
      }

      formControls[field.name] = [field.defaultValue || '', validators];
    });

    this.formGroup = this.fb.group(formControls);

    // Trigger change detection
    if (this.cdr) {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.formGroup.valid) {
      this.formSubmit.emit(this.formGroup.value);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.formGroup.controls).forEach((key) => {
        const control = this.formGroup.get(key);
        control?.markAsTouched();
      });
    }

    // Trigger change detection
    if (this.cdr) {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }

  onCancel(): void {
    this.formGroup.reset();
    this.submitted = false;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || this.submitted)
    );
  }

  getErrorMessage(field: FormField): string {
    const control = this.formGroup.get(field.name);

    if (!control || !control.errors) return '';

    if (field.validationMessage) return field.validationMessage;

    if (control.errors['required']) {
      return `${field.label} is required`;
    }

    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }

    if (control.errors['minlength']) {
      return `${field.label} must be at least ${field.minLength} characters`;
    }

    if (control.errors['maxlength']) {
      return `${field.label} cannot exceed ${field.maxLength} characters`;
    }

    if (control.errors['min']) {
      return `${field.label} must be at least ${field.min}`;
    }

    if (control.errors['max']) {
      return `${field.label} cannot exceed ${field.max}`;
    }

    return 'Invalid value';
  }

  get formClasses(): string {
    return `dynamic-form ${
      this.formLayout === 'horizontal' ? 'form-horizontal' : 'form-vertical'
    }`;
  }
}
