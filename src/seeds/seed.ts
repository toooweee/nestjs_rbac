import { seedRoles } from './roles';

async function main() {
  await seedRoles();
  console.log('Roles seeded successfully!');
}

main()
  .then(() => {
    console.log('All seeds ran successfully');
  })
  .catch((err) => console.log(err));
