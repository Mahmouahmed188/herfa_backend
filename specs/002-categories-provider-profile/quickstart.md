# Quickstart: Categories & Provider Profiles

## Prerequisites

- NestJS project with TypeORM, PostgreSQL
- Existing entities: `ServiceCategory`, `ProviderProfile`, `Service`
- Existing modules: `ProvidersModule`, `ServicesModule`

## Migration

```bash
# Generate migration for new provider_categories table + experience_years column
npm run migration:generate -- src/database/migrations/AddProviderCategoriesAndExperience

# Apply migration
npm run migration:run
```

## Module Setup

### 1. Create CategoriesModule (if new) or refactor ServicesModule

```bash
nest generate module modules/categories
nest generate service modules/categories
nest generate controller modules/categories
```

Register entities in `CategoriesModule`:
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([ServiceCategory])],
  controllers: [CategoriesController, AdminCategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
```

### 2. Update ProvidersModule

Add `ProviderCategory` entity and `experienceYears` support:
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, ProviderProfile, ProviderApplication,
      ProviderService, Service, ProviderCategory,  // ADD ProviderCategory
    ]),
  ],
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
```

## Implementation Steps

1. **Entity**: Create `ProviderCategory` entity
2. **Entity**: Add `experienceYears` to `ProviderProfile`
3. **DTO**: Create `CreateCategoryDto`, `UpdateCategoryDto`
4. **DTO**: Create `ProviderCategoryDto` (with `categoryIds: string[]`)
5. **DTO**: Update `SearchProvidersDto` (add `categoryId`, `sortBy`, `sortOrder`)
6. **Service**: Create `CategoriesService` with CRUD
7. **Service**: Update `ProvidersService` with category selection + enhanced search
8. **Controller**: Create `CategoriesController` (public) + `AdminCategoriesController`
9. **Controller**: Update `ProvidersController` (category endpoints, verification, suspension)
10. **Guards**: Reuse existing `JwtAuthGuard` + `RolesGuard`
11. **Swagger**: Decorate all new endpoints
12. **Tests**: Unit + integration tests

## Verification

```bash
# Run unit tests
npm run test -- --testPathPattern="(categories|providers)"

# Run integration tests
npm run test:e2e

# Lint
npm run lint
```

## Rollback

```bash
# Revert migration
npm run migration:revert

# Remove new files
Remove-Item -Recurse src/modules/categories/
Remove-Item src/entities/provider-category.entity.ts
```
