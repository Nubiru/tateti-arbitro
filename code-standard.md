# Development Rulebook

_Today's date is 08 of October 2025_

## Core Principles

1. **Six-Stage Development Process**:
   - **Stage 1**: Problem Definition - Define the issue, context, and scope
   - **Stage 2**: Problem Analysis - Focus attention on root cause identification
   - **Stage 3**: Solution Research - Investigate, reference docs, explore options
   - **Stage 4**: Algorithm Design - Create solution without over-engineering
   - **Stage 5**: Implementation Plan - Verbatim step-by-step execution guide
   - **Stage 6**: Systematic Execution - Incremental actions toward 100% completion
2. **Test-Driven Development**: Always follow the TDD cycle: Problem Reasoning → Solution Algorithm
   → Tests → Code
3. **Domain-Driven Design**: Organize code by business domains and responsibilities
4. **Migration Safety**: Handle migrations with extreme care - check build artifacts for lost code
5. **Test Pipeline Integrity**: Verify tests run against source files, not compiled artifacts
6. **Single Source of Truth**: This rulebook guides all development decisions
7. **Excellence**: Every line of code reflects commitment to quality
8. **No Over-Engineering**: Perfect balance of functionality and simplicity

## TDD MANDATORY WORKFLOW

**When reasoning on ANY problem that will result in new functionality:**

1. **Problem Reasoning**: Analyze requirements, identify edge cases, define success criteria
2. **Solution Algorithm**: Design approach, plan data flow, consider error handling
3. **Tests First**: Write comprehensive tests for all scenarios (normal, fail, success, edge cases)
4. **Code Implementation**: Implement algorithm guided by tests, refactor as needed

## MIGRATION SAFETY PROTOCOL

**Before ANY migration or major refactoring:**

1. **Check Build Artifacts**: Always verify for lost code or cached builds before making changes
2. **Commit Current State**: Ensure all work is committed before migration
3. **Test Pipeline Verification**: Confirm tests run against source files, not compiled artifacts
4. **Incremental Migration**: Migrate one domain/component at a time
5. **Validation After Each Step**: Verify functionality before proceeding to next step
6. **Rollback Plan**: Always have a clear rollback strategy

## JEST RUNNER WORKFLOW

**Use Jest Runner VSCode extension for seamless TDD development:**

1. **Write Test First**: Create test file with comprehensive scenarios
2. **Run Test (Should Fail)**: Click "Run" above test - see red failure (expected)
3. **Implement Code**: Write minimal code to make test pass
4. **Run Test Again (Should Pass)**: Click "Run" - see green success
5. **Refactor with Confidence**: Modify code, tests auto-re-run in watch mode
6. **Debug When Needed**: Click "Debug" to set breakpoints and step through code

**Jest Runner Features:**

- **One-Click Execution**: Run individual tests, suites, or files
- **Inline Debugging**: Set breakpoints directly in VSCode
- **Watch Mode**: Automatic re-running on file changes
- **Real-Time Results**: See test results instantly without terminal
- **Coverage Integration**: Visual coverage indicators in editor

## UNIT TEST SPEED PRINCIPLES

- **Speed-First**: Unit tests must run instantly without external dependencies
- **Mock Everything**: No real API calls, database, or network dependencies
- **Comprehensive Inputs**: Test normal, success, bad, negative, edge, special cases
- **Electronic Precision**: Each test validates specific input/output like robotic programming
- **No Async**: Unit tests are synchronous, no waiting or hanging

## TEST CONFIGURATION & SETUP

**Jest Configuration Structure:**

- **Root Config**: `jest.config.js` - Monorepo configuration with project references
- **Unit Tests**: `jest.config.unit.js` - Speed-first configuration (1s timeout, 4 workers)
- **Integration Tests**: `jest.config.integration.js` - Real dependencies (10s timeout, 2 workers)
- **Performance Tests**: `jest.config.performance.js` - Load testing (30s timeout, 1 worker)

**Test Organization:**

- **Unit Tests**: `tests/unit/` - 80% focus, instant execution
- **Integration Tests**: `tests/integration/` - 15% focus, real dependencies
- **Performance Tests**: `tests/performance/` - 5% focus, load validation
- **Mocks**: `tests/mocks/` - Organized by service and component category

**VSCode Integration:**

- **Jest Runner**: Primary test execution extension with one-click running
- **CodeLens**: "Run" and "Debug" buttons above each test
- **Watch Mode**: `Ctrl+Shift+P` → "Jest Runner: Start Jest in Watch Mode"
- **Debug Support**: Set breakpoints and debug tests directly in VSCode

---

## SYSTEM ARCHITECTURE

### Frontend Architecture

- **Component-Based Design**: Modular, reusable components with clear responsibilities
- **State Management**: Centralized state management for game state and UI state
- **Real-Time Updates**: WebSocket integration for live game updates
- **No Direct API Calls**: Components must use centralized data layer, never call APIs directly

### Backend Architecture

- **Service-Oriented Design**: Clear separation of concerns with focused services
- **API Management**: RESTful endpoints with proper error handling and validation
- **Circuit Breakers**: Automatic failure detection and recovery for external dependencies
- **Health Monitoring**: Real-time service health and performance tracking

### Game-Specific Requirements

- **Arbitrator Service**: Core game logic and player communication management
- **Player Communication**: HTTP-based communication with external player services
- **Game State Management**: Immutable game state with complete history tracking
- **Validation Layer**: Comprehensive input validation and error handling

---

## DEVELOPMENT STANDARDS

### File Management

- **File Headers**: Complete headers with @lastModified, @todo, @version
- **Naming Conventions**: Follow established patterns (kebab-case backend, PascalCase frontend)
- **Domain-Centric Organization**: Group by business domain and responsibility, not by type
- **Service Structure**: Each service is self-contained with consistent patterns
- **Clear File Organization**: Logical folder structure that reflects system architecture

### Code Quality

- **Test-First Development**: Write tests before implementation - all normal, fail, success, and
  edge cases
- **No Breadcrumbs**: Remove unused imports, variables, empty functions
- **Console Logging**: Maximum 3 logs per file, zero in production
- **Smart Comments**: Explain WHY, not WHAT
- **TypeScript**: 0 compilation errors, **NEVER use `any` types** - use `unknown` and proper type
  guards
- **Type Safety**: All functions must have proper parameter and return types
- **Type Guards**: Use `unknown` instead of `any` in type guard functions with proper validation
- **Structured Logging**: Use service-specific logging with clean one-line format
- **Clean Code**: Self-documenting code with meaningful names and clear structure

### Testing Architecture

- **TDD Cycle**: Problem Reasoning → Solution Algorithm → Tests → Code implementation
- **Jest Runner Integration**: Use VSCode Jest Runner extension for seamless test execution
- **Speed-First Unit Tests**: Instant execution, mock everything, no external dependencies
- **Comprehensive Test Coverage**: All normal, fail, success, and edge cases before coding
- **Background Process Management**: All processes must implement cleanup patterns
- **Test Isolation**: Each test runs in isolation with proper setup/teardown
- **Performance Testing**: Validate response times and cache performance
- **One-Click Testing**: Run individual tests, suites, or files directly from VSCode
- **Inline Debugging**: Set breakpoints and debug tests without leaving the editor
- **Watch Mode**: Automatic test re-running for TDD development cycle

### Logging Standards

- **Service-Specific Logging**: Use `logger.serviceInfo(service, layer, operation, message, data)`
  format
- **Clean One-Line Format**:
  `[MM-DDTHH:mm][LEVEL][CATEGORY][service][layer][operation]: message | key=value`
- **Key Data Inline**: Include important data fields inline for quick scanning
- **Consistent Operations**: Use standard operation names across all services
- **Log Level Control**: Use `LOG_LEVEL` environment variable for production control

---

## SERVICE MANAGEMENT

### System Initialization

- **Parallel Health Checks**: Initialize all services with proper health validation
- **Circuit Breaker Protection**: Prevents cascading failures across services
- **Centralized Logging**: Environment-based log levels and structured logging
- **Graceful Startup**: Services start in dependency order with proper error handling

### Health Monitoring

- **Real-time Status**: Health status updates via WebSocket or polling
- **Service Status Tracking**: Monitor all service connections and dependencies
- **Performance Metrics**: Real-time system performance monitoring
- **Error Tracking**: Comprehensive error logging and alerting

### External Service Management

- **Service Control**: Centralized enable/disable controls for external dependencies
- **Circuit Breaker States**: CLOSED, OPEN, HALF-OPEN state management
- **Rate Limiting**: Quota tracking and backoff management
- **Fallback Strategies**: Graceful degradation when external services are unavailable

---

## FRONTEND DEVELOPMENT

### Component Architecture

- **Error Boundaries**: All critical components wrapped with error boundaries
- **Lazy Loading**: Implement lazy loading for heavy components
- **Design Consistency**: Use established design patterns and styling
- **Type Safety**: Shared types between frontend and backend
- **Reusable Components**: Build modular, composable UI components

### Performance Requirements

- **Bundle Size**: Keep bundle size optimized for fast loading
- **First Contentful Paint**: <1.5s for responsive user experience
- **Real-Time Updates**: Smooth rendering with live game updates
- **Event Latency**: <2s detection and notification latency for user interactions

---

## BACKEND DEVELOPMENT

### Service Architecture

- **Domain-Driven Design**: Organize services by business domain and responsibility
- **Service-Centric Organization**: Group by responsibility, not by type
- **Consistent Service Structure**: Every service follows the same pattern
- **Service Root Files**: Core service files in service root for easy discovery
- **Minimal Folders**: Only essential folders for focused organization
- **Consistent Naming**: All service files follow `service-name.component.js` pattern
- **Service Components**: Service (coordination), Controller (HTTP), Routes (definitions),
  Adapter (external communication), Validators (validation), Error Handler (error handling)
- **Self-Contained Services**: All service code in one place for easy maintenance
- **Service-Level Features**: Caching, circuit breakers, rate limiting, error handling per service
- **Service Documentation**: Each service has comprehensive documentation

### Resilience Patterns

- **Service-Level Resilience**: Each service implements its own resilience patterns
- **Concurrency Protection**: Prevents race conditions
- **Service-Level Rate Limiting**: API endpoints protected against abuse per service
- **Service-Level Circuit Breakers**: Automatic failure detection and recovery per service
- **Service-Level Performance Monitoring**: Real-time tracking and optimization per service

---

## ERROR HANDLING

### Error Boundaries

- **Component Error Boundaries**: For React Components
- **Router Error Boundaries**: For navigation errors
- **Service Error Boundaries**: For backend service errors
- **ErrorDisplay Component**: Consistent error presentation across the application

---

## QUALITY GATES

### Development Workflow

- **TDD First**: Always start with problem reasoning, then algorithm, then tests, then code
- **TypeScript**: 0 compilation errors
- **Linting**: All rules passing
- **Tests**: All tests passing
- **Build**: Successful compilation
- **Performance**: Meets established thresholds

### Testing Standards

- **TDD Mandatory**: Tests written before any implementation code
- **Speed-First Unit Tests**: Instant execution, comprehensive input coverage, mock everything
- **Comprehensive Coverage**: All normal, fail, success, and edge cases covered
- **Unit Tests**: ≥ 85% coverage
- **Integration Tests**: All critical flows
- **E2E Tests**: Main user flows
- **Performance Tests**: All critical components

---

## CRITICAL LESSONS

### Migration Safety (CRITICAL)

- **Check build artifacts FIRST** - Lost code often exists in build artifacts
- **Test pipeline runs against source files** - Not compiled JavaScript
- **Clear all caches before testing** - Jest, node_modules caches
- **Commit work before migration** - Never lose progress
- **Incremental migration only** - One domain at a time

### Build System Integrity

- **Never change external packages** without thorough testing
- **Optimize your own code first** before changing external packages
- **Create rollback plans** for any build system changes
- **Verify test pipeline** - Ensure tests run against source, not compiled files

### Docker Development

- **Use appropriate docker-compose files** for development and testing
- **Backend runs in Docker container** for consistent development environment
- **Test in containerized environment** to match production deployment

### Over-Engineering Prevention

- **TDD Prevents Over-Engineering** - tests force you to think through the problem first
- **Never over-engineer simple fixes** - solve immediate problem with minimal changes
- **Keep existing service patterns** unless there's clear architectural benefit
- **Question whether new services/abstractions are needed**
- **Follow domain-driven organization** - organize by business domain and responsibility
