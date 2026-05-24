package migrations

func Migrate() error {
	if err := AuthMigration(); err != nil {
		return err
	}

	if err := QrMigration(); err != nil {
		return err
	}

	if err := StaticQrMigration(); err != nil {
		return err
	}

	return nil
}
